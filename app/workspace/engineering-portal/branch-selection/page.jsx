"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { GraduationCap, Code, Zap, Wrench, Building, Lightbulb } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function BranchSelection() {
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    fetchBranches()
    checkExistingEnrollment()
  }, [user])

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/engineering-branches')
      setBranches(response.data.branches || [])
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      toast.error('Failed to load engineering branches')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingEnrollment = async () => {
    if (!user) return
    
    try {
      const response = await axios.get('/api/user-branches')
      if (response.data.branches && response.data.branches.length > 0) {
        // User already has branch enrollment, redirect to dashboard
        router.push('/workspace/engineering-portal/dashboard')
      }
    } catch (error) {
      // No existing enrollment, continue with selection
    }
  }

  const getBranchIcon = (branchCode) => {
    switch (branchCode) {
      case 'CSE': return <Code className="h-12 w-12 text-blue-500" />
      case 'ECE': return <Zap className="h-12 w-12 text-yellow-500" />
      case 'MECH': return <Wrench className="h-12 w-12 text-gray-600" />
      case 'CIVIL': return <Building className="h-12 w-12 text-orange-500" />
      case 'EEE': return <Lightbulb className="h-12 w-12 text-green-500" />
      default: return <GraduationCap className="h-12 w-12 text-purple-500" />
    }
  }

  const getBranchColor = (branchCode) => {
    switch (branchCode) {
      case 'CSE': return 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
      case 'ECE': return 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50'
      case 'MECH': return 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
      case 'CIVIL': return 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'
      case 'EEE': return 'border-green-200 hover:border-green-400 hover:bg-green-50'
      default: return 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
    }
  }

  const enrollInBranch = async () => {
    if (!selectedBranch || !user) {
      toast.error('Please select a branch and ensure you are logged in')
      return
    }

    try {
      setEnrolling(true)
      const response = await axios.post('/api/user-branches', {
        branchCode: selectedBranch,
        isPrimary: true,
        semester: 1
      })

      if (response.data.success) {
        toast.success('Successfully enrolled in branch!')
        router.push('/workspace/engineering-portal/dashboard')
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Failed to enroll in branch. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading engineering branches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Engineering Branch</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select your engineering specialization to access branch-specific content, tools, and resources tailored for your academic journey.
          </p>
        </div>

        {/* Branch Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {branches.map((branch) => {
            const isSelected = selectedBranch === branch.branchCode
            // Handle both string arrays and JSON arrays
            let subjects = []
            let tools = []
            
            try {
              subjects = typeof branch.subjects === 'string' 
                ? JSON.parse(branch.subjects) 
                : (branch.subjects || [])
            } catch (e) {
              subjects = []
            }
            
            try {
              tools = typeof branch.toolsAvailable === 'string' 
                ? JSON.parse(branch.toolsAvailable) 
                : (branch.toolsAvailable || [])
            } catch (e) {
              tools = []
            }
            
            return (
              <Card 
                key={branch.branchCode}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-primary border-primary bg-primary/5' 
                    : getBranchColor(branch.branchCode)
                }`}
                onClick={() => setSelectedBranch(branch.branchCode)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getBranchIcon(branch.branchCode)}
                  </div>
                  <CardTitle className="text-xl">{branch.branchName}</CardTitle>
                  <Badge variant="outline" className="mx-auto">
                    {branch.branchCode}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm text-center">
                    {branch.description}
                  </p>
                  
                  {/* Key Subjects */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Subjects:</h4>
                    <div className="flex flex-wrap gap-1">
                      {subjects.slice(0, 4).map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {subjects.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{subjects.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Available Tools */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Specialized Tools:</h4>
                    <div className="space-y-1">
                      {tools.slice(0, 3).map((tool, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Selection Summary */}
        {selectedBranch && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Ready to start your journey?</h3>
                <p className="text-gray-600">
                  You've selected <strong>{branches.find(b => b.branchCode === selectedBranch)?.branchName}</strong>.
                  You'll get access to specialized content, tools, and resources for this branch.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedBranch('')}
                  >
                    Change Selection
                  </Button>
                  <Button 
                    onClick={enrollInBranch}
                    disabled={enrolling}
                    size="lg"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      'Start Learning'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Don't worry! You can always add more branches later or switch your primary branch from your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BranchSelection