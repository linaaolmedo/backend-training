'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Student, CreateStudentData, UpdateStudentData } from '@/types/student'
import StudentTable from '@/components/StudentTable'
import StudentForm from '@/components/StudentForm'
import Link from 'next/link'

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('student')
        .select('*')
        .order('last_name', { ascending: true })

      if (error) throw error
      setStudents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async (studentData: CreateStudentData) => {
    try {
      // Log the data being sent for debugging
      console.log('Creating student with data:', studentData)
      
      const { data, error } = await supabase
        .from('student')
        .insert([studentData])
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        
        // Handle specific error types
        if (error.code === '23505') {
          // Unique constraint violation
          if (error.message.includes('ssid')) {
            throw new Error('A student with this SSID already exists. Please use a different SSID.')
          }
          throw new Error('A student with this information already exists.')
        } else if (error.code === '23503') {
          // Foreign key constraint violation
          if (error.message.includes('practitioner_id')) {
            throw new Error('The selected practitioner does not exist. Please select a valid practitioner.')
          }
          throw new Error('Invalid reference to another record.')
        } else if (error.code === '23502') {
          // Not null constraint violation
          throw new Error(`Required field is missing: ${error.message}`)
        }
        
        throw error
      }
      
      setStudents([...students, ...(data || [])])
      setShowForm(false)
      setError(null)
      console.log('Student created successfully:', data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while creating the student'
      setError(errorMessage)
      console.error('Error creating student:', err)
      
      // Log the full error for debugging
      if (err && typeof err === 'object') {
        console.error('Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
      }
    }
  }

  const handleUpdateStudent = async (studentData: UpdateStudentData) => {
    try {
      const { data, error } = await supabase
        .from('student')
        .update(studentData)
        .eq('id', studentData.id)
        .select()

      if (error) throw error
      
      setStudents(students.map(student => 
        student.id === studentData.id ? (data?.[0] || student) : student
      ))
      setEditingStudent(null)
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating student:', err)
    }
  }

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('student')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setStudents(students.filter(student => student.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting student:', err)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStudent(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading students...</p>
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
                className="text-green-600 hover:text-green-500 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Portal
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Student Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Student</span>
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

        <StudentTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
} 