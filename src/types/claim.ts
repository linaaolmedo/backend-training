export interface Claim {
  id: number
  claim_number: string
  batch_number?: string
  status: string
  service_date?: string
  billed_amount?: number
  paid_amount?: number
  finalized_date?: string
  service_code?: string
  service_description?: string
  quantity?: number
  quantity_type?: string
  location?: string
  frequency_type?: string
  rendering_provider?: string
  rendering_provider_npi?: string
  referring_provider?: string
  referring_provider_npi?: string
  district?: string
  student_ssid?: string
  student_name?: string
  student_dob?: string
  insurance_type?: string
  insurance_carrier?: string
  medi_cal_eligible?: boolean
  carelon_id?: string
  consent_to_treat?: boolean
  consent_to_bill?: boolean
  remittance_data?: Record<string, unknown>
  created_at?: string
}

export interface CreateClaimData {
  claim_number: string
  batch_number?: string
  status?: string
  service_date?: string
  billed_amount?: number
  paid_amount?: number
  finalized_date?: string
  service_code?: string
  service_description?: string
  quantity?: number
  quantity_type?: string
  location?: string
  frequency_type?: string
  rendering_provider?: string
  rendering_provider_npi?: string
  referring_provider?: string
  referring_provider_npi?: string
  district?: string
  student_ssid?: string
  student_name?: string
  student_dob?: string
  insurance_type?: string
  insurance_carrier?: string
  medi_cal_eligible?: boolean
  carelon_id?: string
  consent_to_treat?: boolean
  consent_to_bill?: boolean
  remittance_data?: Record<string, unknown>
}

export interface UpdateClaimData extends Partial<CreateClaimData> {
  id: number
} 