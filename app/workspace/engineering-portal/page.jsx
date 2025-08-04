"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'

function EngineeringPortalEntry() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkUserBranch()
    }
  }, [user])

  const checkUserBranch = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      
      if (branches.length === 0) {
        // No branch enrollment, redirect to branch selection
        router.push('/workspace/engineering-portal/branch-selection')
      } else {
        // Has branch enrollment, redirect to dashboard
        router.push('/workspace/engineering-portal/dashboard')
      }
    } catch (error) {
      console.error('Failed to check user branch:', error)
      // Default to branch selection if error
      router.push('/workspace/engineering-portal/branch-selection')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading Engineering Portal...</p>
        </div>
      </div>
    )
  }

  return null
}

export default EngineeringPortalEntry