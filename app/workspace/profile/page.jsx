"use client"
import React, { useState } from 'react'
import { ArrowLeft, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useUser } from '@clerk/nextjs'

function UserProfile() {
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <Link href="/workspace">
          <Button variant="outline" size="sm" className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your account and preferences</p>
        </div>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <User className="h-5 w-5" />
            <span>User Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-base sm:text-lg">{user?.fullName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-base sm:text-lg break-all">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
              <div>
                <h4 className="font-medium">Account Security</h4>
                <p className="text-sm text-gray-600">Manage your password and security settings</p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Manage in Clerk
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
              <div>
                <h4 className="font-medium">Notification Preferences</h4>
                <p className="text-sm text-gray-600">Control how you receive notifications</p>
              </div>
              <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfile