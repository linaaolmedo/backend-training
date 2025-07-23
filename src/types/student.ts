export interface Student {
  id: number
  ssid: string
  local_id?: string
  first_name: string
  last_name: string
  preferred_name?: string
  birthdate: string
  status: string
  last_modified_at?: string
  gender?: string
  grade?: number
  district: string
  school?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  primary_contact_name?: string
  primary_contact_phone?: string
  transportation_team?: string
  transportation_needs?: string
  practitioner_id?: number
  primary_disability?: string
  parental_consent_on_file: boolean
  parental_consent_in_bill: boolean
  parental_consent_given: boolean
  parental_consent_date?: string
  comments?: string
  insurance_type?: string
  insurance_carrier?: string
  insurance_group_number?: string
  insurance_policy_number?: string
  insurance_effective_date?: string
  medi_cal_eligible: boolean
  medi_cal_benefits_id?: string
  copay_id?: string
  iep_date?: string
  next_review_date?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export interface CreateStudentData {
  ssid: string
  local_id?: string
  first_name: string
  last_name: string
  preferred_name?: string
  birthdate: string
  status: string
  gender?: string
  grade?: number
  district: string
  school?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  primary_contact_name?: string
  primary_contact_phone?: string
  transportation_team?: string
  transportation_needs?: string
  practitioner_id?: number
  primary_disability?: string
  parental_consent_on_file: boolean
  parental_consent_in_bill: boolean
  parental_consent_given: boolean
  parental_consent_date?: string
  comments?: string
  insurance_type?: string
  insurance_carrier?: string
  insurance_group_number?: string
  insurance_policy_number?: string
  insurance_effective_date?: string
  medi_cal_eligible: boolean
  medi_cal_benefits_id?: string
  copay_id?: string
  iep_date?: string
  next_review_date?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: number
} 