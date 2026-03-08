export interface PersonName {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  full_name_raw: string | null;
}

export interface Address {
  street_1: string | null;
  street_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  province_or_region: string | null;
  foreign_postal_code: string | null;
  foreign_address: boolean;
  address_raw: string | null;
}

export interface Person {
  person_id: string;
  name: PersonName;
  ssn: string | null;
  itin: string | null;
  atin: string | null;
  tin_type: "ssn" | "itin" | "atin" | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  age_end_of_tax_year: number | null;
  blind: boolean | null;
  disabled: boolean | null;
  student: boolean | null;
  can_be_claimed_as_dependent: boolean | null;
}

export interface IdentitySection {
  taxpayer: Person;
  spouse: Person | null;
  address: Address;
  phone: string | null;
  email: string | null;
}

export interface Box12Entry {
  code: string;
  amount: number | null;
}

export interface NamedAmount {
  label: string | null;
  amount: number | null;
}

export interface W2StateLocalEntry {
  state: string | null;
  state_employer_id: string | null;
  state_wages: number | null;
  state_income_tax: number | null;
  locality_name: string | null;
  local_wages: number | null;
  local_income_tax: number | null;
}

export interface DocumentBase {
  document_id: string;
  document_type: string;
  source_type: "user_input" | "uploaded_pdf" | "uploaded_image" | "ocr" | "manual_entry" | "api_import" | "derived";
  source_filename: string | null;
  issuer_name: string | null;
  recipient_name: string | null;
  recipient_tin: string | null;
  tax_year: number | null;
  is_amended_document: boolean | null;
  raw_text_excerpt: string | null;
}

export interface W2Document extends DocumentBase {
  document_type: "W-2";
  employer_name: string | null;
  employer_ein: string | null;
  employer_address: string | null;
  control_number: string | null;
  employee_name: string | null;
  employee_first_name: string | null;
  employee_middle_initial: string | null;
  employee_last_name: string | null;
  employee_suffix: string | null;
  employee_address: string | null;
  employee_ssn: string | null;
  box1_wages: number | null;
  box2_federal_withholding: number | null;
  box3_social_security_wages: number | null;
  box4_social_security_tax_withheld: number | null;
  box5_medicare_wages_tips: number | null;
  box6_medicare_tax_withheld: number | null;
  box7_social_security_tips: number | null;
  box8_allocated_tips: number | null;
  box9_verification_code: string | null;
  box10_dependent_care_benefits: number | null;
  box11_nonqualified_plans: number | null;
  box12: Box12Entry[];
  box13_statutory_employee: boolean | null;
  box13_retirement_plan: boolean | null;
  box13_third_party_sick_pay: boolean | null;
  box14: NamedAmount[];
  state_and_local: W2StateLocalEntry[];
}

export interface DocumentsSection {
  w2: W2Document[];
  information_returns: DocumentBase[];
  business_supporting_documents: DocumentBase[];
  other_supporting_documents: DocumentBase[];
}

export interface ReturnData {
  schema_version: string;
  identity: IdentitySection;
  documents: DocumentsSection;
}

export function createEmptyPersonName(): PersonName {
  return {
    first_name: "",
    middle_name: null,
    last_name: "",
    suffix: null,
    full_name_raw: null,
  };
}

export function createEmptyAddress(): Address {
  return {
    street_1: null,
    street_2: null,
    city: null,
    state: null,
    postal_code: null,
    country: "US",
    province_or_region: null,
    foreign_postal_code: null,
    foreign_address: false,
    address_raw: null,
  };
}

export function createEmptyPerson(personId: string): Person {
  return {
    person_id: personId,
    name: createEmptyPersonName(),
    ssn: null,
    itin: null,
    atin: null,
    tin_type: "ssn",
    date_of_birth: null,
    date_of_death: null,
    age_end_of_tax_year: null,
    blind: null,
    disabled: null,
    student: null,
    can_be_claimed_as_dependent: null,
  };
}

export function createEmptyIdentity(): IdentitySection {
  return {
    taxpayer: createEmptyPerson("taxpayer"),
    spouse: null,
    address: createEmptyAddress(),
    phone: null,
    email: null,
  };
}

export function createEmptyDocuments(): DocumentsSection {
  return {
    w2: [],
    information_returns: [],
    business_supporting_documents: [],
    other_supporting_documents: [],
  };
}

export function createEmptyReturnData(): ReturnData {
  return {
    schema_version: "2023-return-pipeline-draft-v1",
    identity: createEmptyIdentity(),
    documents: createEmptyDocuments(),
  };
}

export function createEmptyW2(documentId: string): W2Document {
  return {
    document_id: documentId,
    document_type: "W-2",
    source_type: "manual_entry",
    source_filename: null,
    issuer_name: null,
    recipient_name: null,
    recipient_tin: null,
    tax_year: 2023,
    is_amended_document: null,
    raw_text_excerpt: null,
    employer_name: null,
    employer_ein: null,
    employer_address: null,
    control_number: null,
    employee_name: null,
    employee_first_name: null,
    employee_middle_initial: null,
    employee_last_name: null,
    employee_suffix: null,
    employee_address: null,
    employee_ssn: null,
    box1_wages: null,
    box2_federal_withholding: null,
    box3_social_security_wages: null,
    box4_social_security_tax_withheld: null,
    box5_medicare_wages_tips: null,
    box6_medicare_tax_withheld: null,
    box7_social_security_tips: null,
    box8_allocated_tips: null,
    box9_verification_code: null,
    box10_dependent_care_benefits: null,
    box11_nonqualified_plans: null,
    box12: [],
    box13_statutory_employee: null,
    box13_retirement_plan: null,
    box13_third_party_sick_pay: null,
    box14: [],
    state_and_local: [],
  };
}

export const BOX12_CODES = [
  "A", "B", "C", "D", "E", "F", "G", "H",
  "J", "K", "L", "M", "N", "P", "Q", "R",
  "S", "T", "V", "W", "Y", "Z",
  "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH",
] as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;
