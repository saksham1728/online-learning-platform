"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, GraduationCap, Settings, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function UserProfile() {
  const [userBranches, setUserBranches] = useState([])
  const [availableBranches, setAvailableBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    semester: '',
    academicYear: '',
    newBranch: ''
  })
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's enrolled branches
      const branchesResponse = await axios.get('/api/user-branches')
      setUserBranches(branchesResponse.data.branches || [])
      
      // Fetch all available branches
      const availableResponse = await axios.get('/api/engineering-branches')
      setAvailableBranches(availableResponse.data.branches || [])
      
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      toast.error('Failed to load profile information')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBranch = async (branchCode, updates) => {
    try {
      const response = await axios.put('/api/user-branches', {
        branchCode,
        ...updates
      })
      
      if (response.data.success) {
        toast.success('Branch information updated successfully')
        fetchUserData()
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to update branch:', error)
      toast.error('Failed to update branch information')
    }
  }

  const handleAddBranch = async () => {
    if (!editData.newBranch) {
      toast.error('Please select a branch to add')
      return
    }

    try {
      const response = await axios.post('/api/user-branches', {
        branchCode: editData.newBranch,
        isPrimary: userBranches.length === 0, // First branch becomes primary
        semester: parseInt(editData.semester) || 1,
        academicYear: editData.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
      })
      
      if (response.data.success) {
        toast.success('Branch added successfully')
        fetchUserData()
        setEditData({ semester: '', academicYear: '', newBranch: '' })
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to add branch:', error)
      toast.error('Failed to add branch')
    }
  }

  const handleSetPrimary = async (branchCode) => {
    try {
      const response = await axios.put('/api/user-branches', {
        branchCode,
        isPrimary: true
      })
      
      if (response.data.success) {
        toast.success('Primary branch updated')
        fetchUserData()
      }
    } catch (error) {
      console.error('Failed to set primary branch:', error)
      toast.error('Failed to update primary branch')
    }
  }

  const getBranchIcon = (branchCode) => {
    const iconMap = {
      'CSE': '💻',
      'ECE': '⚡',
      'MECH': '⚙️',
      'CIVIL': '🏗️',
      'EEE': '💡'
    }
    return iconMap[branchCode] || '🎓'
  }

  const getAvailableBranchesToAdd = () => {
    const enrolledCodes = userBranches.map(b => b.branchCode)
    return availableBranches.filter(b => !enrolledCodes.includes(b.branchCode))
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering-dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-gray-600">Manage your branch enrollments and academic information</p>
          </div>
        </div>
        <Button 
          onClick={() => setEditing(!editing)}
          variant={editing ? "outline" : "default"}
        >
          {editing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg">{user?.fullName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Branch Enrollments</span>
            </div>
            {userBranches.length > 0 && (
              <Badge variant="outline">
                {userBranches.length} Branch{userBranches.length > 1 ? 'es' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userBranches.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Branch Enrollment</h3>
              <p className="text-gray-500 mb-4">You haven't enrolled in any engineering branch yet.</p>
              <Link href="/workspace/branch-selection">
                <Button>Select Your Branch</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userBranches.map((branch, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getBranchIcon(branch.branchCode)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{branch.branchName}</h3>
                        <p className="text-sm text-gray-600">{branch.branchCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {branch.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                      {!branch.isPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(branch.branchCode)}
                        >
                          Set as Primary
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-600">Current Semester</label>
                      {editing ? (
                        <Select 
                          value={editData.semester || branch.semester?.toString()} 
                          onValueChange={(value) => setEditData({...editData, semester: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8].map(sem => (
                              <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1">Semester {branch.semester}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-medium text-gray-600">Academic Year</label>
                      {editing ? (
                        <Input
                          value={editData.academicYear || branch.academicYear}
                          onChange={(e) => setEditData({...editData, academicYear: e.target.value})}
                          placeholder="2023-2024"
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1">{branch.academicYear}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-medium text-gray-600">Enrolled Since</label>
                      <p className="mt-1">{new Date(branch.enrollmentDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateBranch(branch.branchCode, {
                          semester: parseInt(editData.semester) || branch.semester,
                          academicYear: editData.academicYear || branch.academicYear
                        })}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Branch */}
      {editing && getAvailableBranchesToAdd().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Branch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Select Branch</label>
                <Select value={editData.newBranch} onValueChange={(value) => setEditData({...editData, newBranch: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableBranchesToAdd().map(branch => (
                      <SelectItem key={branch.branchCode} value={branch.branchCode}>
                        {getBranchIcon(branch.branchCode)} {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Starting Semester</label>
                <Select value={editData.semester} onValueChange={(value) => setEditData({...editData, semester: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Academic Year</label>
                <Input
                  value={editData.academicYear}
                  onChange={(e) => setEditData({...editData, academicYear: e.target.value})}
                  placeholder="2023-2024"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleAddBranch}>
                Add Branch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Account Security</h4>
                <p className="text-sm text-gray-600">Manage your password and security settings</p>
              </div>
              <Button variant="outline" size="sm">
                Manage in Clerk
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Notification Preferences</h4>
                <p className="text-sm text-gray-600">Control how you receive notifications</p>
              </div>
              <Button variant="outline" size="sm" disabled>
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