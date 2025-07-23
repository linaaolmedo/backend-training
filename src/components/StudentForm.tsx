'use client'

import { useState, useEffect } from 'react'
import { Student, CreateStudentData, UpdateStudentData } from '@/types/student'
import { supabase } from '@/utils/supabase/client'

// Helper function to validate date format
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return true // Allow empty dates
  const date = new Date(dateString)
  const isValidDateObject = date instanceof Date && !isNaN(date.getTime())
  const matchesFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  return isValidDateObject && matchesFormat
}

interface StudentFormProps {
  student?: Student | null
  onSubmit: (studentData: CreateStudentData | UpdateStudentData) => Promise<void>
  onClose: () => void
}

export default function StudentForm({ student, onSubmit, onClose }: StudentFormProps) {
  const [formData, setFormData] = useState({
    ssid: '',
    local_id: '',
    first_name: '',
    last_name: '',
    preferred_name: '',
    birthdate: '',
    status: 'Active',
    gender: '',
    grade: '',
    district: '',
    school: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    primary_contact_name: '',
    primary_contact_phone: '',
    transportation_team: '',
    transportation_needs: '',
    practitioner_id: '',
    primary_disability: '',
    parental_consent_on_file: false,
    parental_consent_in_bill: false,
    parental_consent_given: false,
    parental_consent_date: '',
    comments: '',
    insurance_type: '',
    insurance_carrier: '',
    insurance_group_number: '',
    insurance_policy_number: '',
    insurance_effective_date: '',
    medi_cal_eligible: false,
    medi_cal_benefits_id: '',
    copay_id: '',
    iep_date: '',
    next_review_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [practitioners, setPractitioners] = useState<Array<{id: number, first_name: string, last_name: string, role: string}>>([])
  const [loadingPractitioners, setLoadingPractitioners] = useState(false)

  const tabs = [
    { name: 'Basic Info', icon: '👤' },
    { name: 'Education', icon: '📚' },
    { name: 'Contacts', icon: '📞' },
    { name: 'Medical/IEP', icon: '🏥' },
    { name: 'Insurance', icon: '🏛️' },
    { name: 'Consent', icon: '✅' }
  ]

  useEffect(() => {
    if (student) {
      setFormData({
        ssid: student.ssid || '',
        local_id: student.local_id || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        preferred_name: student.preferred_name || '',
        birthdate: student.birthdate || '',
        status: student.status || 'Active',
        gender: student.gender || '',
        grade: student.grade?.toString() || '',
        district: student.district || '',
        school: student.school || '',
        address: student.address || '',
        city: student.city || '',
        state: student.state || '',
        zip_code: student.zip_code || '',
        primary_contact_name: student.primary_contact_name || '',
        primary_contact_phone: student.primary_contact_phone || '',
        transportation_team: student.transportation_team || '',
        transportation_needs: student.transportation_needs || '',
        practitioner_id: student.practitioner_id?.toString() || '',
        primary_disability: student.primary_disability || '',
        parental_consent_on_file: student.parental_consent_on_file || false,
        parental_consent_in_bill: student.parental_consent_in_bill || false,
        parental_consent_given: student.parental_consent_given || false,
        parental_consent_date: student.parental_consent_date || '',
        comments: student.comments || '',
        insurance_type: student.insurance_type || '',
        insurance_carrier: student.insurance_carrier || '',
        insurance_group_number: student.insurance_group_number || '',
        insurance_policy_number: student.insurance_policy_number || '',
        insurance_effective_date: student.insurance_effective_date || '',
        medi_cal_eligible: student.medi_cal_eligible || false,
        medi_cal_benefits_id: student.medi_cal_benefits_id || '',
        copay_id: student.copay_id || '',
        iep_date: student.iep_date || '',
        next_review_date: student.next_review_date || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_phone: student.emergency_contact_phone || ''
      })
    }
  }, [student])

  useEffect(() => {
    const fetchPractitioners = async () => {
      setLoadingPractitioners(true)
      try {
        const { data, error } = await supabase
          .from('app_user')
          .select('id, first_name, last_name, role')
          .in('role', ['Practitioner', 'Supervisor'])
          .eq('status', 'Active')
          .order('last_name', { ascending: true })

        if (error) throw error
        setPractitioners(data || [])
      } catch (err) {
        console.error('Error fetching practitioners:', err)
        // Don't show alert, just log the error - practitioners are optional
      } finally {
        setLoadingPractitioners(false)
      }
    }

    fetchPractitioners()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields before submitting
      const requiredFields = ['ssid', 'first_name', 'last_name', 'birthdate', 'district']
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      }

      // Validate SSID format (should not be empty or just whitespace)
      if (!formData.ssid.trim()) {
        throw new Error('SSID cannot be empty')
      }

      // Validate date format for birthdate
      if (formData.birthdate && !isValidDate(formData.birthdate)) {
        throw new Error('Birthdate must be a valid date')
      }

      // Clean and convert data for database submission
      const submitData = {
        ...formData,
        // Convert grade to number or undefined
        grade: formData.grade ? parseInt(formData.grade) : undefined,
        // Convert practitioner_id to number or undefined  
        practitioner_id: formData.practitioner_id ? parseInt(formData.practitioner_id) : undefined,
        // Ensure boolean fields are proper booleans
        parental_consent_on_file: Boolean(formData.parental_consent_on_file),
        parental_consent_in_bill: Boolean(formData.parental_consent_in_bill),
        parental_consent_given: Boolean(formData.parental_consent_given),
        medi_cal_eligible: Boolean(formData.medi_cal_eligible),
        // Trim string fields to remove extra whitespace
        ssid: formData.ssid.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        district: formData.district.trim(),
        // Convert empty strings to undefined for optional fields
        local_id: formData.local_id?.trim() || undefined,
        preferred_name: formData.preferred_name?.trim() || undefined,
        gender: formData.gender || undefined,
        school: formData.school?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        zip_code: formData.zip_code?.trim() || undefined,
        // Convert empty date strings to undefined
        parental_consent_date: formData.parental_consent_date || undefined,
        insurance_effective_date: formData.insurance_effective_date || undefined,
        iep_date: formData.iep_date || undefined,
        next_review_date: formData.next_review_date || undefined
      }

      // Log the data being submitted for debugging
      console.log('Submitting student data:', submitData)

      if (student) {
        await onSubmit({ id: student.id, ...submitData } as UpdateStudentData)
      } else {
        await onSubmit(submitData as CreateStudentData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      
      // Show error message to user if needed
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('An unexpected error occurred while submitting the form')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          SSID *
        </label>
        <input
          type="text"
          name="ssid"
          value={formData.ssid}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Local ID
        </label>
        <input
          type="text"
          name="local_id"
          value={formData.local_id}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          First Name *
        </label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Last Name *
        </label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Name
        </label>
        <input
          type="text"
          name="preferred_name"
          value={formData.preferred_name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Birthdate *
        </label>
        <input
          type="date"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Gender
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select gender...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Transferred">Transferred</option>
          <option value="Graduated">Graduated</option>
        </select>
      </div>
    </div>
  )

  const renderEducation = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Grade
        </label>
        <select
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select grade...</option>
          <option value="-1">Pre-K</option>
          <option value="0">K</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          District *
        </label>
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          School
        </label>
        <input
          type="text"
          name="school"
          value={formData.school}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Primary Disability
        </label>
        <input
          type="text"
          name="primary_disability"
          value={formData.primary_disability}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          City
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          State
        </label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ZIP Code
        </label>
        <input
          type="text"
          name="zip_code"
          value={formData.zip_code}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  )

  const renderContacts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Primary Contact Name
        </label>
        <input
          type="text"
          name="primary_contact_name"
          value={formData.primary_contact_name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Primary Contact Phone
        </label>
        <input
          type="tel"
          name="primary_contact_phone"
          value={formData.primary_contact_phone}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Emergency Contact Name
        </label>
        <input
          type="text"
          name="emergency_contact_name"
          value={formData.emergency_contact_name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Emergency Contact Phone
        </label>
        <input
          type="tel"
          name="emergency_contact_phone"
          value={formData.emergency_contact_phone}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Transportation Team
        </label>
        <input
          type="text"
          name="transportation_team"
          value={formData.transportation_team}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Practitioner ID
        </label>
        <select
          name="practitioner_id"
          value={formData.practitioner_id}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Practitioner (Optional)</option>
          {loadingPractitioners ? (
            <option value="">Loading practitioners...</option>
          ) : practitioners.length > 0 ? (
            practitioners.map(practitioner => (
              <option key={practitioner.id} value={practitioner.id}>
                {practitioner.first_name} {practitioner.last_name} ({practitioner.role})
              </option>
            ))
          ) : (
            <option value="">No practitioners found</option>
          )}
        </select>
        {!loadingPractitioners && practitioners.length === 0 && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No practitioners found. You can{' '}
            <a 
              href="/user-management" 
              className="text-green-600 hover:text-green-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              create practitioners
            </a>{' '}
            in User Management, or leave this field empty.
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Transportation Needs
        </label>
        <textarea
          name="transportation_needs"
          value={formData.transportation_needs}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Comments
        </label>
        <textarea
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  )

  const renderMedicalIEP = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          IEP Date
        </label>
        <input
          type="date"
          name="iep_date"
          value={formData.iep_date}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Next Review Date
        </label>
        <input
          type="date"
          name="next_review_date"
          value={formData.next_review_date}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  )

  const renderInsurance = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Insurance Type
        </label>
        <input
          type="text"
          name="insurance_type"
          value={formData.insurance_type}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Insurance Carrier
        </label>
        <input
          type="text"
          name="insurance_carrier"
          value={formData.insurance_carrier}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Group Number
        </label>
        <input
          type="text"
          name="insurance_group_number"
          value={formData.insurance_group_number}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Policy Number
        </label>
        <input
          type="text"
          name="insurance_policy_number"
          value={formData.insurance_policy_number}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Effective Date
        </label>
        <input
          type="date"
          name="insurance_effective_date"
          value={formData.insurance_effective_date}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="medi_cal_eligible"
          checked={formData.medi_cal_eligible}
          onChange={handleChange}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Medi-Cal Eligible
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Medi-Cal Benefits ID
        </label>
        <input
          type="text"
          name="medi_cal_benefits_id"
          value={formData.medi_cal_benefits_id}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Copay ID
        </label>
        <input
          type="text"
          name="copay_id"
          value={formData.copay_id}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  )

  const renderConsent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="parental_consent_on_file"
            checked={formData.parental_consent_on_file}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Consent on File
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="parental_consent_in_bill"
            checked={formData.parental_consent_in_bill}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Consent to Bill
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="parental_consent_given"
            checked={formData.parental_consent_given}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Consent Given
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Parental Consent Date
        </label>
        <input
          type="date"
          name="parental_consent_date"
          value={formData.parental_consent_date}
          onChange={handleChange}
          className="mt-1 block w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderBasicInfo()
      case 1: return renderEducation()
      case 2: return renderContacts()
      case 3: return renderMedicalIEP()
      case 4: return renderInsurance()
      case 5: return renderConsent()
      default: return renderBasicInfo()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === index
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {activeTab > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
              )}
              {activeTab < tabs.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 