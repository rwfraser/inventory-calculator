import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Plus, Trash2, Loader2, Save } from "lucide-react";
import { BOX12_CODES, US_STATES } from "@shared/types/pipeline";
import type { W2Document, Box12Entry, NamedAmount, W2StateLocalEntry } from "@shared/types/pipeline";

interface W2FormProps {
  initialData?: W2Document | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isPending: boolean;
}

function CurrencyInput({ value, onChange, id, ...props }: {
  value: number | null;
  onChange: (v: number | null) => void;
  id: string;
  [key: string]: any;
}) {
  const [display, setDisplay] = useState(value != null ? value.toFixed(2) : "");

  useEffect(() => {
    if (value != null) {
      setDisplay(value.toFixed(2));
    }
  }, [value]);

  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      className="font-mono text-right"
      value={display}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        setDisplay(raw);
        const num = parseFloat(raw);
        onChange(isNaN(num) ? null : Math.round(num * 100) / 100);
      }}
      onBlur={() => {
        if (value != null) setDisplay(value.toFixed(2));
      }}
      placeholder="0.00"
      {...props}
    />
  );
}

function SSNInput({ value, onChange, id, ...props }: {
  value: string | null;
  onChange: (v: string | null) => void;
  id: string;
  [key: string]: any;
}) {
  return (
    <Input
      id={id}
      type="text"
      className="font-mono"
      value={value || ""}
      onChange={(e) => {
        let raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
        if (raw.length > 5) raw = raw.slice(0, 3) + "-" + raw.slice(3, 5) + "-" + raw.slice(5);
        else if (raw.length > 3) raw = raw.slice(0, 3) + "-" + raw.slice(3);
        onChange(raw || null);
      }}
      placeholder="XXX-XX-XXXX"
      maxLength={11}
      {...props}
    />
  );
}

function EINInput({ value, onChange, id, ...props }: {
  value: string | null;
  onChange: (v: string | null) => void;
  id: string;
  [key: string]: any;
}) {
  return (
    <Input
      id={id}
      type="text"
      className="font-mono"
      value={value || ""}
      onChange={(e) => {
        let raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
        if (raw.length > 2) raw = raw.slice(0, 2) + "-" + raw.slice(2);
        onChange(raw || null);
      }}
      placeholder="XX-XXXXXXX"
      maxLength={10}
      {...props}
    />
  );
}

export default function W2Form({ initialData, onSubmit, onCancel, isPending }: W2FormProps) {
  const [employeeSSN, setEmployeeSSN] = useState(initialData?.employee_ssn || null);
  const [employerEIN, setEmployerEIN] = useState(initialData?.employer_ein || null);
  const [employerName, setEmployerName] = useState(initialData?.employer_name || "");
  const [employerAddress, setEmployerAddress] = useState(initialData?.employer_address || "");
  const [controlNumber, setControlNumber] = useState(initialData?.control_number || "");
  const [firstName, setFirstName] = useState(initialData?.employee_first_name || "");
  const [middleInitial, setMiddleInitial] = useState(initialData?.employee_middle_initial || "");
  const [lastName, setLastName] = useState(initialData?.employee_last_name || "");
  const [suffix, setSuffix] = useState(initialData?.employee_suffix || "");
  const [employeeAddress, setEmployeeAddress] = useState(initialData?.employee_address || "");

  const [box1, setBox1] = useState<number | null>(initialData?.box1_wages ?? null);
  const [box2, setBox2] = useState<number | null>(initialData?.box2_federal_withholding ?? null);
  const [box3, setBox3] = useState<number | null>(initialData?.box3_social_security_wages ?? null);
  const [box4, setBox4] = useState<number | null>(initialData?.box4_social_security_tax_withheld ?? null);
  const [box5, setBox5] = useState<number | null>(initialData?.box5_medicare_wages_tips ?? null);
  const [box6, setBox6] = useState<number | null>(initialData?.box6_medicare_tax_withheld ?? null);
  const [box7, setBox7] = useState<number | null>(initialData?.box7_social_security_tips ?? null);
  const [box8, setBox8] = useState<number | null>(initialData?.box8_allocated_tips ?? null);
  const [box9, setBox9] = useState(initialData?.box9_verification_code || "");
  const [box10, setBox10] = useState<number | null>(initialData?.box10_dependent_care_benefits ?? null);
  const [box11, setBox11] = useState<number | null>(initialData?.box11_nonqualified_plans ?? null);

  const [box12, setBox12] = useState<Box12Entry[]>(
    initialData?.box12?.length ? initialData.box12 : [{ code: "", amount: null }]
  );
  const [box13Statutory, setBox13Statutory] = useState(initialData?.box13_statutory_employee ?? false);
  const [box13Retirement, setBox13Retirement] = useState(initialData?.box13_retirement_plan ?? false);
  const [box13ThirdParty, setBox13ThirdParty] = useState(initialData?.box13_third_party_sick_pay ?? false);
  const [box14, setBox14] = useState<NamedAmount[]>(
    initialData?.box14?.length ? initialData.box14 : [{ label: "", amount: null }]
  );
  const [stateLocal, setStateLocal] = useState<W2StateLocalEntry[]>(
    initialData?.state_and_local?.length ? initialData.state_and_local : [{
      state: null, state_employer_id: null, state_wages: null, state_income_tax: null,
      locality_name: null, local_wages: null, local_income_tax: null,
    }]
  );

  const warnings: string[] = [];
  if (box3 != null && box3 > 160200) {
    warnings.push("Box 3 exceeds the 2023 Social Security wage base ($160,200)");
  }
  if (box3 != null && box4 != null && box3 > 0) {
    const expected = Math.round(box3 * 6.2) / 100;
    if (Math.abs(box4 - expected) > 1) {
      warnings.push(`Box 4 ($${box4.toFixed(2)}) should approximate Box 3 × 6.2% ($${expected.toFixed(2)})`);
    }
  }
  if (box5 != null && box6 != null && box5 > 0) {
    const expected = Math.round(box5 * 1.45) / 100;
    if (Math.abs(box6 - expected) > 1) {
      warnings.push(`Box 6 ($${box6.toFixed(2)}) should approximate Box 5 × 1.45% ($${expected.toFixed(2)})`);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredBox12 = box12.filter(b => b.code);
    const filteredBox14 = box14.filter(b => b.label || b.amount != null);
    const filteredStateLocal = stateLocal.filter(s =>
      s.state || s.state_wages != null || s.state_income_tax != null || s.local_wages != null
    );

    onSubmit({
      employee_ssn: employeeSSN,
      employer_ein: employerEIN,
      employer_name: employerName,
      employer_address: employerAddress || null,
      control_number: controlNumber || null,
      employee_first_name: firstName,
      employee_middle_initial: middleInitial || null,
      employee_last_name: lastName,
      employee_suffix: suffix || null,
      employee_address: employeeAddress || null,
      box1_wages: box1 ?? 0,
      box2_federal_withholding: box2 ?? 0,
      box3_social_security_wages: box3,
      box4_social_security_tax_withheld: box4,
      box5_medicare_wages_tips: box5,
      box6_medicare_tax_withheld: box6,
      box7_social_security_tips: box7,
      box8_allocated_tips: box8,
      box9_verification_code: box9 || null,
      box10_dependent_care_benefits: box10,
      box11_nonqualified_plans: box11,
      box12: filteredBox12,
      box13_statutory_employee: box13Statutory,
      box13_retirement_plan: box13Retirement,
      box13_third_party_sick_pay: box13ThirdParty,
      box14: filteredBox14,
      state_and_local: filteredStateLocal,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0" data-testid="w2-form">
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Form W-2 &mdash; Wage and Tax Statement &mdash; 2023
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
          <div className="divide-y">
            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">a Employee's social security number</Label>
              <SSNInput id="employee_ssn" value={employeeSSN} onChange={setEmployeeSSN} data-testid="input-employee-ssn" />
            </div>

            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">b Employer identification number (EIN)</Label>
              <EINInput id="employer_ein" value={employerEIN} onChange={setEmployerEIN} data-testid="input-employer-ein" />
            </div>

            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">c Employer's name, address, and ZIP code</Label>
              <Input
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                placeholder="Employer name"
                className="mb-1"
                required
                data-testid="input-employer-name"
              />
              <textarea
                value={employerAddress}
                onChange={(e) => setEmployerAddress(e.target.value)}
                placeholder="Address, City, State ZIP"
                className="w-full text-sm border rounded-md px-3 py-2 bg-background resize-none"
                rows={2}
                data-testid="input-employer-address"
              />
            </div>

            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">d Control number</Label>
              <Input
                value={controlNumber}
                onChange={(e) => setControlNumber(e.target.value)}
                placeholder="Optional"
                data-testid="input-control-number"
              />
            </div>

            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">e Employee's first name and initial &nbsp; Last name &nbsp; Suff.</Label>
              <div className="grid grid-cols-12 gap-1">
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  className="col-span-4"
                  required
                  data-testid="input-employee-first-name"
                />
                <Input
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())}
                  placeholder="M"
                  className="col-span-2 text-center"
                  maxLength={1}
                  data-testid="input-employee-middle-initial"
                />
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  className="col-span-4"
                  required
                  data-testid="input-employee-last-name"
                />
                <Input
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="Suff."
                  className="col-span-2 text-center"
                  maxLength={4}
                  data-testid="input-employee-suffix"
                />
              </div>
            </div>

            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">f Employee's address and ZIP code</Label>
              <textarea
                value={employeeAddress}
                onChange={(e) => setEmployeeAddress(e.target.value)}
                placeholder="Address, City, State ZIP"
                className="w-full text-sm border rounded-md px-3 py-2 bg-background resize-none"
                rows={2}
                data-testid="input-employee-address"
              />
            </div>
          </div>

          <div className="divide-y">
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">1 Wages, tips, other compensation</Label>
                <CurrencyInput id="box1" value={box1} onChange={setBox1} data-testid="input-box1" />
              </div>
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">2 Federal income tax withheld</Label>
                <CurrencyInput id="box2" value={box2} onChange={setBox2} data-testid="input-box2" />
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">3 Social security wages</Label>
                <CurrencyInput id="box3" value={box3} onChange={setBox3} data-testid="input-box3" />
              </div>
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">4 Social security tax withheld</Label>
                <CurrencyInput id="box4" value={box4} onChange={setBox4} data-testid="input-box4" />
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">5 Medicare wages and tips</Label>
                <CurrencyInput id="box5" value={box5} onChange={setBox5} data-testid="input-box5" />
              </div>
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">6 Medicare tax withheld</Label>
                <CurrencyInput id="box6" value={box6} onChange={setBox6} data-testid="input-box6" />
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">7 Social security tips</Label>
                <CurrencyInput id="box7" value={box7} onChange={setBox7} data-testid="input-box7" />
              </div>
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">8 Allocated tips</Label>
                <CurrencyInput id="box8" value={box8} onChange={setBox8} data-testid="input-box8" />
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">9 Verification code</Label>
                <Input
                  value={box9}
                  onChange={(e) => setBox9(e.target.value)}
                  placeholder=""
                  data-testid="input-box9"
                />
              </div>
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">10 Dependent care benefits</Label>
                <CurrencyInput id="box10" value={box10} onChange={setBox10} data-testid="input-box10" />
              </div>
            </div>
            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">11 Nonqualified plans</Label>
              <CurrencyInput id="box11" value={box11} onChange={setBox11} data-testid="input-box11" />
            </div>
          </div>
        </div>

        <div className="border-t divide-y">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
            <div className="p-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">12 See instructions for box 12</Label>
              {box12.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground w-6">{String.fromCharCode(97 + idx)}</span>
                  <Select
                    value={entry.code || "__none__"}
                    onValueChange={(v) => {
                      const updated = [...box12];
                      updated[idx] = { ...updated[idx], code: v === "__none__" ? "" : v };
                      setBox12(updated);
                    }}
                  >
                    <SelectTrigger className="w-20" data-testid={`select-box12-code-${idx}`}>
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">--</SelectItem>
                      {BOX12_CODES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CurrencyInput
                    id={`box12_amount_${idx}`}
                    value={entry.amount}
                    onChange={(v) => {
                      const updated = [...box12];
                      updated[idx] = { ...updated[idx], amount: v };
                      setBox12(updated);
                    }}
                    data-testid={`input-box12-amount-${idx}`}
                  />
                  {box12.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBox12(box12.filter((_, i) => i !== idx))}
                      data-testid={`button-remove-box12-${idx}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {box12.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBox12([...box12, { code: "", amount: null }])}
                  className="mt-1"
                  data-testid="button-add-box12"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              )}
            </div>

            <div className="divide-y">
              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">13</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={box13Statutory}
                      onCheckedChange={(v) => setBox13Statutory(!!v)}
                      data-testid="checkbox-box13-statutory"
                    />
                    Statutory employee
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={box13Retirement}
                      onCheckedChange={(v) => setBox13Retirement(!!v)}
                      data-testid="checkbox-box13-retirement"
                    />
                    Retirement plan
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={box13ThirdParty}
                      onCheckedChange={(v) => setBox13ThirdParty(!!v)}
                      data-testid="checkbox-box13-third-party"
                    />
                    Third-party sick pay
                  </label>
                </div>
              </div>

              <div className="p-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">14 Other</Label>
                {box14.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <Input
                      value={entry.label || ""}
                      onChange={(e) => {
                        const updated = [...box14];
                        updated[idx] = { ...updated[idx], label: e.target.value || null };
                        setBox14(updated);
                      }}
                      placeholder="Description"
                      className="flex-1"
                      data-testid={`input-box14-label-${idx}`}
                    />
                    <CurrencyInput
                      id={`box14_amount_${idx}`}
                      value={entry.amount}
                      onChange={(v) => {
                        const updated = [...box14];
                        updated[idx] = { ...updated[idx], amount: v };
                        setBox14(updated);
                      }}
                      data-testid={`input-box14-amount-${idx}`}
                    />
                    {box14.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBox14(box14.filter((_, i) => i !== idx))}
                        data-testid={`button-remove-box14-${idx}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBox14([...box14, { label: "", amount: null }])}
                  className="mt-1"
                  data-testid="button-add-box14"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-3">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
            15-20 State and local tax information
          </Label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-state-local">
              <thead>
                <tr className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left p-1 font-normal">15 State</th>
                  <th className="text-left p-1 font-normal">Employer's state ID</th>
                  <th className="text-right p-1 font-normal">16 State wages</th>
                  <th className="text-right p-1 font-normal">17 State income tax</th>
                  <th className="text-right p-1 font-normal">18 Local wages</th>
                  <th className="text-right p-1 font-normal">19 Local income tax</th>
                  <th className="text-left p-1 font-normal">20 Locality</th>
                  <th className="p-1"></th>
                </tr>
              </thead>
              <tbody>
                {stateLocal.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-1">
                      <Select
                        value={row.state || "__none__"}
                        onValueChange={(v) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], state: v === "__none__" ? null : v };
                          setStateLocal(updated);
                        }}
                      >
                        <SelectTrigger className="w-20" data-testid={`select-state-${idx}`}>
                          <SelectValue placeholder="--" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">--</SelectItem>
                          {US_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-1">
                      <Input
                        value={row.state_employer_id || ""}
                        onChange={(e) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], state_employer_id: e.target.value || null };
                          setStateLocal(updated);
                        }}
                        className="font-mono"
                        data-testid={`input-state-employer-id-${idx}`}
                      />
                    </td>
                    <td className="p-1">
                      <CurrencyInput
                        id={`state_wages_${idx}`}
                        value={row.state_wages}
                        onChange={(v) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], state_wages: v };
                          setStateLocal(updated);
                        }}
                        data-testid={`input-state-wages-${idx}`}
                      />
                    </td>
                    <td className="p-1">
                      <CurrencyInput
                        id={`state_tax_${idx}`}
                        value={row.state_income_tax}
                        onChange={(v) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], state_income_tax: v };
                          setStateLocal(updated);
                        }}
                        data-testid={`input-state-tax-${idx}`}
                      />
                    </td>
                    <td className="p-1">
                      <CurrencyInput
                        id={`local_wages_${idx}`}
                        value={row.local_wages}
                        onChange={(v) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], local_wages: v };
                          setStateLocal(updated);
                        }}
                        data-testid={`input-local-wages-${idx}`}
                      />
                    </td>
                    <td className="p-1">
                      <CurrencyInput
                        id={`local_tax_${idx}`}
                        value={row.local_income_tax}
                        onChange={(v) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], local_income_tax: v };
                          setStateLocal(updated);
                        }}
                        data-testid={`input-local-tax-${idx}`}
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        value={row.locality_name || ""}
                        onChange={(e) => {
                          const updated = [...stateLocal];
                          updated[idx] = { ...updated[idx], locality_name: e.target.value || null };
                          setStateLocal(updated);
                        }}
                        data-testid={`input-locality-${idx}`}
                      />
                    </td>
                    <td className="p-1">
                      {stateLocal.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStateLocal(stateLocal.filter((_, i) => i !== idx))}
                          data-testid={`button-remove-state-${idx}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stateLocal.length < 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStateLocal([...stateLocal, {
                state: null, state_employer_id: null, state_wages: null, state_income_tax: null,
                locality_name: null, local_wages: null, local_income_tax: null,
              }])}
              className="mt-1"
              data-testid="button-add-state-local"
            >
              <Plus className="h-3 w-3 mr-1" /> Add State/Local Row
            </Button>
          )}
        </div>
      </div>

      {warnings.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 mt-4" data-testid="validation-warnings">
          <CardContent className="py-3">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-w2">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} data-testid="button-save-w2">
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {initialData ? "Update W-2" : "Save W-2"}
        </Button>
      </div>
    </form>
  );
}
