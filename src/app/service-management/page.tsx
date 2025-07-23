'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Service, ServiceWithStudentPractitioner, CreateServiceData, UpdateServiceData } from '@/types/service'
import ServiceTable from '@/components/ServiceTable'
import ServiceForm from '@/components/ServiceForm'
import Link from 'next/link'

export default function ServiceManagement() {
  const [services, setServices] = useState<ServiceWithStudentPractitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithStudentPractitioner | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('service')
        .select(`
          *,
          student:student_id (
            id,
            first_name,
            last_name,
            ssid
          ),
          practitioner:practitioner_id (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .order('service_date', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (serviceData: CreateServiceData) => {
    try {
      const { data, error } = await supabase
        .from('service')
        .insert([serviceData])
        .select(`
          *,
          student:student_id (
            id,
            first_name,
            last_name,
            ssid
          ),
          practitioner:practitioner_id (
            id,
            first_name,
            last_name,
            role
          )
        `)

      if (error) throw error
      
      setServices([...(data || []), ...services])
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating service:', err)
    }
  }

  const handleUpdateService = async (serviceData: UpdateServiceData) => {
    try {
      const { data, error } = await supabase
        .from('service')
        .update(serviceData)
        .eq('id', serviceData.id)
        .select(`
          *,
          student:student_id (
            id,
            first_name,
            last_name,
            ssid
          ),
          practitioner:practitioner_id (
            id,
            first_name,
            last_name,
            role
          )
        `)

      if (error) throw error
      
      setServices(services.map(service => 
        service.id === serviceData.id ? (data?.[0] || service) : service
      ))
      setEditingService(null)
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating service:', err)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('service')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setServices(services.filter(service => service.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting service:', err)
    }
  }

  const handleEditService = (service: ServiceWithStudentPractitioner) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingService(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-purple-600 hover:text-purple-500 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Portal
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Service Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Service</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <ServiceTable
          services={services}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      </div>

      {showForm && (
        <ServiceForm
          service={editingService}
          onSubmit={editingService ? handleUpdateService : handleCreateService}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
} 