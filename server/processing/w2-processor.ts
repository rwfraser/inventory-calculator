import type { W2Document, ReturnData } from "@shared/types/pipeline";
import crypto from "crypto";

const SS_WAGE_BASE_2023 = 160200;
const SS_TAX_RATE = 0.062;
const MEDICARE_TAX_RATE = 0.0145;
const TOLERANCE = 1.00;

interface ProvenanceRecord {
  provenance_id: string;
  target_path: string;
  source_references: SourceReference[];
  method: string;
  confidence: number;
  explanation: {
    summary: string;
    detail: string | null;
    reference_type: string | null;
    reference_id: string | null;
    reference_locator: string | null;
  };
}

interface SourceReference {
  source_type: string;
  source_id: string;
  field_path: string | null;
  locator: string | null;
}

interface DiagnosticItem {
  code: string;
  severity: string;
  message: string;
  field_path: string | null;
  related_source_ids: string[];
  blocking: boolean;
  suggested_resolution: string | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function createProvenance(
  targetPath: string,
  w2s: W2Document[],
  fieldPath: string,
  method: string,
  summary: string
): ProvenanceRecord {
  return {
    provenance_id: crypto.randomUUID(),
    target_path: targetPath,
    source_references: w2s.map((w) => ({
      source_type: "document",
      source_id: w.document_id,
      field_path: fieldPath,
      locator: null,
    })),
    method,
    confidence: 1.0,
    explanation: {
      summary,
      detail: null,
      reference_type: "document_parse",
      reference_id: null,
      reference_locator: null,
    },
  };
}

export function processW2s(returnData: ReturnData): {
  income: any;
  payments: any;
  provenance: ProvenanceRecord[];
  diagnostics: any;
} {
  const w2s = returnData.documents.w2;
  const provenance: ProvenanceRecord[] = [];
  const warnings: DiagnosticItem[] = [];
  const errors: DiagnosticItem[] = [];

  const totalWages = round2(w2s.reduce((s, w) => s + (w.box1_wages || 0), 0));
  const totalFedWithholding = round2(w2s.reduce((s, w) => s + (w.box2_federal_withholding || 0), 0));
  const totalSSWages = round2(w2s.reduce((s, w) => s + (w.box3_social_security_wages || 0), 0));
  const totalSSTax = round2(w2s.reduce((s, w) => s + (w.box4_social_security_tax_withheld || 0), 0));
  const totalMedicareWages = round2(w2s.reduce((s, w) => s + (w.box5_medicare_wages_tips || 0), 0));
  const totalMedicareTax = round2(w2s.reduce((s, w) => s + (w.box6_medicare_tax_withheld || 0), 0));

  provenance.push(createProvenance(
    "income.wages.total_wages",
    w2s, "box1_wages", "calculation",
    `Sum of Box 1 wages from ${w2s.length} W-2(s)`
  ));

  provenance.push(createProvenance(
    "payments.federal_income_tax_withheld",
    w2s, "box2_federal_withholding", "calculation",
    `Sum of Box 2 federal withholding from ${w2s.length} W-2(s)`
  ));

  for (const w2 of w2s) {
    if (w2.box3_social_security_wages != null && w2.box3_social_security_wages > SS_WAGE_BASE_2023) {
      warnings.push({
        code: "W2_SS_WAGE_BASE_EXCEEDED",
        severity: "warning",
        message: `W-2 from ${w2.employer_name}: Box 3 ($${w2.box3_social_security_wages.toFixed(2)}) exceeds the 2023 Social Security wage base ($${SS_WAGE_BASE_2023.toLocaleString()})`,
        field_path: `documents.w2[${w2.document_id}].box3_social_security_wages`,
        related_source_ids: [w2.document_id],
        blocking: false,
        suggested_resolution: "Verify Box 3 amount with employer; it should not exceed $160,200 for 2023",
      });
    }

    if (w2.box3_social_security_wages != null && w2.box4_social_security_tax_withheld != null && w2.box3_social_security_wages > 0) {
      const expected = round2(w2.box3_social_security_wages * SS_TAX_RATE);
      if (Math.abs(w2.box4_social_security_tax_withheld - expected) > TOLERANCE) {
        warnings.push({
          code: "W2_SS_TAX_MISMATCH",
          severity: "warning",
          message: `W-2 from ${w2.employer_name}: Box 4 ($${w2.box4_social_security_tax_withheld.toFixed(2)}) doesn't match Box 3 × 6.2% (expected $${expected.toFixed(2)})`,
          field_path: `documents.w2[${w2.document_id}].box4_social_security_tax_withheld`,
          related_source_ids: [w2.document_id],
          blocking: false,
          suggested_resolution: "Verify with employer; Box 4 should equal Box 3 × 6.2%",
        });
      }
    }

    if (w2.box5_medicare_wages_tips != null && w2.box6_medicare_tax_withheld != null && w2.box5_medicare_wages_tips > 0) {
      const expected = round2(w2.box5_medicare_wages_tips * MEDICARE_TAX_RATE);
      if (Math.abs(w2.box6_medicare_tax_withheld - expected) > TOLERANCE) {
        warnings.push({
          code: "W2_MEDICARE_TAX_MISMATCH",
          severity: "warning",
          message: `W-2 from ${w2.employer_name}: Box 6 ($${w2.box6_medicare_tax_withheld.toFixed(2)}) doesn't match Box 5 × 1.45% (expected $${expected.toFixed(2)})`,
          field_path: `documents.w2[${w2.document_id}].box6_medicare_tax_withheld`,
          related_source_ids: [w2.document_id],
          blocking: false,
          suggested_resolution: "Verify with employer; Box 6 should equal Box 5 × 1.45% (may be higher if Additional Medicare Tax applies)",
        });
      }
    }
  }

  const einCounts = new Map<string, string[]>();
  for (const w2 of w2s) {
    if (w2.employer_ein) {
      const list = einCounts.get(w2.employer_ein) || [];
      list.push(w2.document_id);
      einCounts.set(w2.employer_ein, list);
    }
  }
  for (const [ein, docIds] of einCounts) {
    if (docIds.length > 1) {
      warnings.push({
        code: "W2_DUPLICATE_EMPLOYER_EIN",
        severity: "warning",
        message: `Multiple W-2s share the same employer EIN (${ein}). This may indicate duplicate entries or corrected W-2s.`,
        field_path: null,
        related_source_ids: docIds,
        blocking: false,
        suggested_resolution: "Verify whether these are separate W-2s from the same employer or duplicates that should be consolidated",
      });
    }
  }

  const income = {
    wages: {
      total_wages: totalWages || null,
      unreported_tip_income: null,
      household_employee_wages_not_reported_on_w2: null,
    },
    taxable_interest: null,
    tax_exempt_interest: null,
    ordinary_dividends: null,
    qualified_dividends: null,
    ira_distributions: { gross: null, taxable: null, rollovers: null, qcd: null },
    pensions_and_annuities: { gross: null, taxable: null },
    social_security_benefits: { gross: null, taxable: null, railroad_equivalent: null },
    capital_gains_and_losses: { schedule_d_required: null, net_capital_gain_or_loss: null, dispositions: [] },
    businesses: [],
    rental_royalty_partnership_s_corp_trust_income: { schedule_e_required: null, net_amount: null },
    farm_income: { schedule_f_required: null, net_amount: null },
    unemployment_compensation: null,
    other_income_items: [],
    digital_asset_activity: { question_answer: null, transactions: [] },
  };

  const payments = {
    federal_income_tax_withheld: totalFedWithholding || null,
    estimated_tax_payments: null,
    extension_payment: null,
    excess_social_security_withholding: null,
    credit_for_federal_tax_on_fuels: null,
    other_payments: [],
    refund: {
      refund_amount: null,
      amount_owed: null,
      applied_to_next_year_estimated_tax: null,
      direct_deposit: {
        requested: null,
        routing_number: null,
        account_number: null,
        account_type: null,
      },
    },
  };

  if (w2s.length > 1) {
    const totalSSAcrossW2s = round2(w2s.reduce((s, w) => s + (w.box4_social_security_tax_withheld || 0), 0));
    const maxSSForOneEmployer = round2(SS_WAGE_BASE_2023 * SS_TAX_RATE);
    if (totalSSAcrossW2s > maxSSForOneEmployer) {
      const excess = round2(totalSSAcrossW2s - maxSSForOneEmployer);
      payments.excess_social_security_withholding = excess;

      provenance.push({
        provenance_id: crypto.randomUUID(),
        target_path: "payments.excess_social_security_withholding",
        source_references: w2s.map((w) => ({
          source_type: "document",
          source_id: w.document_id,
          field_path: "box4_social_security_tax_withheld",
          locator: null,
        })),
        method: "calculation",
        confidence: 0.9,
        explanation: {
          summary: `Excess SS withholding: total Box 4 ($${totalSSAcrossW2s.toFixed(2)}) minus max for one employer ($${maxSSForOneEmployer.toFixed(2)}) = $${excess.toFixed(2)}`,
          detail: "This credit is available when multiple employers withheld more Social Security tax than the maximum for the year",
          reference_type: "system_rule",
          reference_id: null,
          reference_locator: null,
        },
      });
    }
  }

  const diagnostics = {
    errors,
    warnings,
    corrections: [],
    open_questions: [],
    duplicate_entities: [],
    ambiguities: [],
  };

  return { income, payments, provenance, diagnostics };
}
