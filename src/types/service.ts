export interface Service {
  id: number
  student_id: number
  practitioner_id: number
  service_date: string
  service_time?: string
  end_time?: string
  duration_minutes?: number
  service_type?: string
  location?: string
  status: string
  case_notes?: string
  appointment_notes?: string
  is_group_service: boolean
  group_name?: string
  created_at?: string
  updated_at?: string
}

export interface CreateServiceData {
  student_id: number
  practitioner_id: number
  service_date: string
  service_time?: string
  end_time?: string
  duration_minutes?: number
  service_type?: string
  location?: string
  status: string
  case_notes?: string
  appointment_notes?: string
  is_group_service: boolean
  group_name?: string
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: number
}

export interface ServiceWithStudentPractitioner extends Service {
  student?: {
    id: number
    first_name: string
    last_name: string
    ssid: string
  }
  practitioner?: {
    id: number
    first_name: string
    last_name: string
    role: string
  }
} 