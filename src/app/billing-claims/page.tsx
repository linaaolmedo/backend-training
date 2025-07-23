'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Claim, CreateClaimData, UpdateClaimData } from '@/types/claim'
import ClaimTable from '@/components/ClaimTable'
import ClaimForm from '@/components/ClaimForm'
import Link from 'next/link'

export default function BillingClaimsManagement() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('claim')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching claims:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClaim = async (claimData: CreateClaimData) => {
    try {
      const { data, error } = await supabase
        .from('claim')
        .insert([claimData])
        .select()

      if (error) throw error
      
      setClaims([...(data || []), ...claims])
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating claim:', err)
    }
  }

  const handleUpdateClaim = async (claimData: UpdateClaimData) => {
    try {
      const { data, error } = await supabase
        .from('claim')
        .update(claimData)
        .eq('id', claimData.id)
        .select()

      if (error) throw error
      
      setClaims(claims.map(claim => 
        claim.id === claimData.id ? (data?.[0] || claim) : claim
      ))
      setEditingClaim(null)
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating claim:', err)
    }
  }

  const handleSubmitClaim = async (claimData: CreateClaimData | UpdateClaimData) => {
    if ('id' in claimData) {
      // This is an update operation
      await handleUpdateClaim(claimData as UpdateClaimData)
    } else {
      // This is a create operation
      await handleCreateClaim(claimData as CreateClaimData)
    }
  }

  const handleDeleteClaim = async (id: number) => {
    if (!confirm('Are you sure you want to delete this claim? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('claim')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setClaims(claims.filter(claim => claim.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting claim:', err)
    }
  }

  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClaim(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading claims...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Claims Management</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage insurance claims and billing information
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Claim
              </button>
            </div>
          </div>
        </div>

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

        <ClaimTable
          claims={claims}
          onEdit={handleEditClaim}
          onDelete={handleDeleteClaim}
        />
      </div>

      {showForm && (
        <ClaimForm
          claim={editingClaim}
          onSubmit={handleSubmitClaim}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
} 