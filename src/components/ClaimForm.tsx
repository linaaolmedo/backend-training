'use client'

import { useState, useEffect } from 'react'
import { Claim, CreateClaimData, UpdateClaimData } from '@/types/claim'
import { Student } from '@/types/student'
import { supabase } from '@/utils/supabase/client'

interface ClaimFormProps {
  claim?: Claim | null
  onSubmit: (claimData: CreateClaimData | UpdateClaimData) => Promise<void>
  onClose: () => void
}

export default function ClaimForm({ claim, onSubmit, onClose }: ClaimFormProps) {
  const [formData, setFormData] = useState({
    claim_number: '',
    batch_number: '',
    status: 'Incomplete',
    service_date: '',
    billed_amount: '',
    paid_amount: '',
    finalized_date: '',
    service_code: '',
    service_description: '',
    quantity: '',
    quantity_type: '',
    location: '',
    frequency_type: '',
    rendering_provider: '',
    rendering_provider_npi: '',
    referring_provider: '',
    referring_provider_npi: '',
    district: '',
    student_ssid: '',
    student_name: '',
    student_dob: '',
    insurance_type: '',
    insurance_carrier: '',
    medi_cal_eligible: false,
    carelon_id: '',
    consent_to_treat: false,
    consent_to_bill: false
  })
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Pick<Student, 'id' | 'ssid' | 'first_name' | 'last_name' | 'district' | 'birthdate'>[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    loadStudents()
    if (claim) {
      setFormData({
        claim_number: claim.claim_number || '',
        batch_number: claim.batch_number || '',
        status: claim.status || 'Incomplete',
        service_date: claim.service_date || '',
        billed_amount: claim.billed_amount?.toString() || '',
        paid_amount: claim.paid_amount?.toString() || '',
        finalized_date: claim.finalized_date || '',
        service_code: claim.service_code || '',
        service_description: claim.service_description || '',
        quantity: claim.quantity?.toString() || '',
        quantity_type: claim.quantity_type || '',
        location: claim.location || '',
        frequency_type: claim.frequency_type || '',
        rendering_provider: claim.rendering_provider || '',
        rendering_provider_npi: claim.rendering_provider_npi || '',
        referring_provider: claim.referring_provider || '',
        referring_provider_npi: claim.referring_provider_npi || '',
        district: claim.district || '',
        student_ssid: claim.student_ssid || '',
        student_name: claim.student_name || '',
        student_dob: claim.student_dob || '',
        insurance_type: claim.insurance_type || '',
        insurance_carrier: claim.insurance_carrier || '',
        medi_cal_eligible: claim.medi_cal_eligible || false,
        carelon_id: claim.carelon_id || '',
        consent_to_treat: claim.consent_to_treat || false,
        consent_to_bill: claim.consent_to_bill || false
      })
    }
  }, [claim])

  const loadStudents = async () => {
    try {
      setLoadingStudents(true)
      const { data, error } = await supabase
        .from('student')
        .select('id, ssid, first_name, last_name, district, birthdate')
        .eq('status', 'Active')
        .order('last_name', { ascending: true })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoadingStudents(false)
    }
  }

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

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value
    if (studentId) {
      const selectedStudent = students.find(s => s.id.toString() === studentId)
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          student_ssid: selectedStudent.ssid,
          student_name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
          student_dob: selectedStudent.birthdate || '',
          district: selectedStudent.district || prev.district
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        billed_amount: formData.billed_amount ? parseFloat(formData.billed_amount) : undefined,
        paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : undefined,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined
      }

      // Remove empty strings
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key]
        }
      })

      if (claim) {
        await onSubmit({ id: claim.id, ...submitData } as UpdateClaimData)
      } else {
        await onSubmit(submitData as CreateClaimData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {claim ? 'Edit Claim' : 'Create New Claim'}
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Claim Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Claim Number *
                </label>
                <input
                  type="text"
                  name="claim_number"
                  value={formData.claim_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batch_number"
                  value={formData.batch_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Incomplete">Incomplete</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Paid">Paid</option>
                  <option value="Denied">Denied</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Student Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Student
                </label>
                <select
                  onChange={handleStudentSelect}
                  disabled={loadingStudents}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.last_name}, {student.first_name} - {student.ssid}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student SSID
                </label>
                <input
                  type="text"
                  name="student_ssid"
                  value={formData.student_ssid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student Date of Birth
                </label>
                <input
                  type="date"
                  name="student_dob"
                  value={formData.student_dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Service Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Code
                </label>
                <input
                  type="text"
                  name="service_code"
                  value={formData.service_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Description
                </label>
                <textarea
                  name="service_description"
                  value={formData.service_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity Type
                </label>
                <input
                  type="text"
                  name="quantity_type"
                  value={formData.quantity_type}
                  onChange={handleChange}
                  placeholder="e.g. minutes, sessions"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency Type
                </label>
                <input
                  type="text"
                  name="frequency_type"
                  value={formData.frequency_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Provider Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rendering Provider
                </label>
                <input
                  type="text"
                  name="rendering_provider"
                  value={formData.rendering_provider}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rendering Provider NPI
                </label>
                <input
                  type="text"
                  name="rendering_provider_npi"
                  value={formData.rendering_provider_npi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Referring Provider
                </label>
                <input
                  type="text"
                  name="referring_provider"
                  value={formData.referring_provider}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Referring Provider NPI
                </label>
                <input
                  type="text"
                  name="referring_provider_npi"
                  value={formData.referring_provider_npi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Billed Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="billed_amount"
                  value={formData.billed_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paid Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="paid_amount"
                  value={formData.paid_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Finalized Date
                </label>
                <input
                  type="date"
                  name="finalized_date"
                  value={formData.finalized_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Insurance Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Type
                </label>
                <input
                  type="text"
                  name="insurance_type"
                  value={formData.insurance_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Carrier
                </label>
                <input
                  type="text"
                  name="insurance_carrier"
                  value={formData.insurance_carrier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Carelon ID
                </label>
                <input
                  type="text"
                  name="carelon_id"
                  value={formData.carelon_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="medi_cal_eligible"
                    checked={formData.medi_cal_eligible}
                    onChange={handleChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Medi-Cal Eligible</span>
                </label>
              </div>
            </div>
          </div>

          {/* Consent Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Consent Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="consent_to_treat"
                  checked={formData.consent_to_treat}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Consent to Treat</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="consent_to_bill"
                  checked={formData.consent_to_bill}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Consent to Bill</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (claim ? 'Update Claim' : 'Create Claim')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 