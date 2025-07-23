export interface AppUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  npi?: string
  license_number?: string
  hire_date?: string
  status: string
  last_login?: string
  role: string
  department?: string
  supervisor_id?: number
  districts?: string[]
  user_type?: string
  permission_level?: string
}

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  npi?: string
  license_number?: string
  hire_date?: string
  status: string
  role: string
  department?: string
  supervisor_id?: number
  districts?: string[]
  user_type?: string
  permission_level?: string
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: number
} 