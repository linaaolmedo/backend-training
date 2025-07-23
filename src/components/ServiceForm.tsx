'use client'

import { useState, useEffect } from 'react'
import { ServiceWithStudentPractitioner, CreateServiceData, UpdateServiceData } from '@/types/service'
import { supabase } from '@/utils/supabase/client'

interface ServiceFormProps {
  service?: ServiceWithStudentPractitioner | null
  onSubmit: (serviceData: CreateServiceData | UpdateServiceData) => Promise<void>
  onClose: () => void
}

interface Student {
  id: number
  first_name: string
  last_name: string
  ssid: string
}

interface Practitioner {
  id: number
  first_name: string
  last_name: string
  role: string
}

export default function ServiceForm({ service, onSubmit, onClose }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    student_id: '',
    practitioner_id: '',
    service_date: '',
    service_time: '',
    end_time: '',
    duration_minutes: '',
    service_type: '',
    location: '',
    status: 'Upcoming',
    case_notes: '',
    appointment_notes: '',
    is_group_service: false,
    group_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [students, setStudents] = useState<Student[]>([])
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const tabs = [
    { name: 'Basic Info', icon: '📅' },
    { name: 'Service Details', icon: '🔧' },
    { name: 'Notes', icon: '📝' }
  ]

  useEffect(() => {
    loadOptions()
  }, [])

  useEffect(() => {
    if (service) {
      setFormData({
        student_id: service.student_id?.toString() || '',
        practitioner_id: service.practitioner_id?.toString() || '',
        service_date: service.service_date || '',
        service_time: service.service_time || '',
        end_time: service.end_time || '',
        duration_minutes: service.duration_minutes?.toString() || '',
        service_type: service.service_type || '',
        location: service.location || '',
        status: service.status || 'Upcoming',
        case_notes: service.case_notes || '',
        appointment_notes: service.appointment_notes || '',
        is_group_service: service.is_group_service || false,
        group_name: service.group_name || ''
      })
    }
  }, [service])

  const loadOptions = async () => {
    try {
      setLoadingOptions(true)
      
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('id, first_name, last_name, ssid')
        .eq('status', 'Active')
        .order('last_name', { ascending: true })

      if (studentsError) throw studentsError
      setStudents(studentsData || [])

      // Load practitioners
      const { data: practitionersData, error: practitionersError } = await supabase
        .from('app_user')
        .select('id, first_name, last_name, role')
        .in('role', ['Practitioner', 'Supervisor'])
        .eq('status', 'Active')
        .order('last_name', { ascending: true })

      if (practitionersError) throw practitionersError
      setPractitioners(practitionersData || [])
    } catch (error) {
      console.error('Error loading options:', error)
    } finally {
      setLoadingOptions(false)
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

  const calculateEndTime = () => {
    if (formData.service_time && formData.duration_minutes) {
      const [hours, minutes] = formData.service_time.split(':').map(Number)
      const startTime = new Date()
      startTime.setHours(hours, minutes, 0, 0)
      
      const endTime = new Date(startTime.getTime() + parseInt(formData.duration_minutes) * 60000)
      const endTimeString = endTime.toTimeString().slice(0, 5)
      
      setFormData(prev => ({
        ...prev,
        end_time: endTimeString
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        practitioner_id: parseInt(formData.practitioner_id),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined
      }

      if (service) {
        await onSubmit({ id: service.id, ...submitData } as UpdateServiceData)
      } else {
        await onSubmit(submitData as CreateServiceData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Student *
        </label>
        <select
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          required
          disabled={loadingOptions}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select student...</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name} ({student.ssid})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Practitioner *
        </label>
        <select
          name="practitioner_id"
          value={formData.practitioner_id}
          onChange={handleChange}
          required
          disabled={loadingOptions}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select practitioner...</option>
          {practitioners.map(practitioner => (
            <option key={practitioner.id} value={practitioner.id}>
              {practitioner.last_name}, {practitioner.first_name} ({practitioner.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Service Date *
        </label>
        <input
          type="date"
          name="service_date"
          value={formData.service_date}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Start Time
        </label>
        <input
          type="time"
          name="service_time"
          value={formData.service_time}
          onChange={(e) => {
            handleChange(e)
            setTimeout(calculateEndTime, 100)
          }}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Duration (minutes)
        </label>
        <input
          type="number"
          name="duration_minutes"
          value={formData.duration_minutes}
          onChange={(e) => {
            handleChange(e)
            setTimeout(calculateEndTime, 100)
          }}
          min="1"
          max="480"
          placeholder="e.g. 60"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          End Time
        </label>
        <input
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Incomplete">Incomplete</option>
        </select>
      </div>
    </div>
  )

  const renderServiceDetails = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Service Type
        </label>
        <select
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select service type...</option>
          <option value="Speech Therapy">Speech Therapy</option>
          <option value="Occupational Therapy">Occupational Therapy</option>
          <option value="Physical Therapy">Physical Therapy</option>
          <option value="Behavioral Therapy">Behavioral Therapy</option>
          <option value="Counseling">Counseling</option>
          <option value="Assessment">Assessment</option>
          <option value="Consultation">Consultation</option>
          <option value="IEP Meeting">IEP Meeting</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select location...</option>
          <option value="School">School</option>
          <option value="Home">Home</option>
          <option value="Clinic">Clinic</option>
          <option value="Online">Online</option>
          <option value="Community">Community</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex items-center md:col-span-2">
        <input
          type="checkbox"
          name="is_group_service"
          checked={formData.is_group_service}
          onChange={handleChange}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          This is a group service
        </label>
      </div>

      {formData.is_group_service && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Group Name
          </label>
          <input
            type="text"
            name="group_name"
            value={formData.group_name}
            onChange={handleChange}
            placeholder="Enter group name..."
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}
    </div>
  )

  const renderNotes = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Appointment Notes
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Notes about scheduling, preparation, or instructions for this appointment
        </p>
        <textarea
          name="appointment_notes"
          value={formData.appointment_notes}
          onChange={handleChange}
          rows={4}
          placeholder="Enter any notes about this appointment..."
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Case Notes
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Clinical notes about the service provided and student progress
        </p>
        <textarea
          name="case_notes"
          value={formData.case_notes}
          onChange={handleChange}
          rows={6}
          placeholder="Enter case notes here..."
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderBasicInfo()
      case 1: return renderServiceDetails()
      case 2: return renderNotes()
      default: return renderBasicInfo()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {service ? 'Edit Service' : 'Add New Service'}
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
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === index
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
            {loadingOptions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading options...</span>
              </div>
            ) : (
              renderTabContent()
            )}
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
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
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
                disabled={loading || loadingOptions}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 