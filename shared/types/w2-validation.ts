import { z } from "zod";

export const box12EntrySchema = z.object({
  code: z.string().min(1),
  amount: z.number().nullable(),
});

export const namedAmountSchema = z.object({
  label: z.string().nullable(),
  amount: z.number().nullable(),
});

export const w2StateLocalSchema = z.object({
  state: z.string().regex(/^[A-Z]{2}$/).nullable(),
  state_employer_id: z.string().nullable(),
  state_wages: z.number().nullable(),
  state_income_tax: z.number().nullable(),
  locality_name: z.string().nullable(),
  local_wages: z.number().nullable(),
  local_income_tax: z.number().nullable(),
});

export const w2FormSchema = z.object({
  employee_ssn: z.string().nullable().optional().default(null),
  employer_ein: z.string().nullable().optional().default(null),
  employer_name: z.string().min(1, "Employer name is required"),
  employer_address: z.string().nullable().optional().default(null),
  control_number: z.string().nullable().optional().default(null),
  employee_first_name: z.string().min(1, "Employee first name is required"),
  employee_middle_initial: z.string().nullable().optional().default(null),
  employee_last_name: z.string().min(1, "Employee last name is required"),
  employee_suffix: z.string().nullable().optional().default(null),
  employee_address: z.string().nullable().optional().default(null),
  box1_wages: z.number({ required_error: "Wages are required" }),
  box2_federal_withholding: z.number({ required_error: "Federal withholding is required" }),
  box3_social_security_wages: z.number().nullable().optional().default(null),
  box4_social_security_tax_withheld: z.number().nullable().optional().default(null),
  box5_medicare_wages_tips: z.number().nullable().optional().default(null),
  box6_medicare_tax_withheld: z.number().nullable().optional().default(null),
  box7_social_security_tips: z.number().nullable().optional().default(null),
  box8_allocated_tips: z.number().nullable().optional().default(null),
  box9_verification_code: z.string().nullable().optional().default(null),
  box10_dependent_care_benefits: z.number().nullable().optional().default(null),
  box11_nonqualified_plans: z.number().nullable().optional().default(null),
  box12: z.array(box12EntrySchema).optional().default([]),
  box13_statutory_employee: z.boolean().nullable().optional().default(null),
  box13_retirement_plan: z.boolean().nullable().optional().default(null),
  box13_third_party_sick_pay: z.boolean().nullable().optional().default(null),
  box14: z.array(namedAmountSchema).optional().default([]),
  state_and_local: z.array(w2StateLocalSchema).optional().default([]),
});

export type W2FormInput = z.infer<typeof w2FormSchema>;

export const identityFormSchema = z.object({
  taxpayer_first_name: z.string().min(1, "Taxpayer first name is required"),
  taxpayer_middle_name: z.string().nullable().optional(),
  taxpayer_last_name: z.string().min(1, "Taxpayer last name is required"),
  taxpayer_ssn: z.string().nullable().optional(),
  spouse_first_name: z.string().nullable().optional(),
  spouse_middle_name: z.string().nullable().optional(),
  spouse_last_name: z.string().nullable().optional(),
  spouse_ssn: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export type IdentityFormInput = z.infer<typeof identityFormSchema>;
