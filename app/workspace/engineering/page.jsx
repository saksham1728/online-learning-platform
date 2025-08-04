"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { 
  Cpu, 
  Zap, 
  Cog, 
  Building, 
  Wrench,
  BookOpen,
  FileText,
  Code,
  Calculator,
  Users,
  TrendingUp,
  Award
} from 'lucide-react'
import BranchSelector from './_components/BranchSelector'
import EngineeringDashboard from './_components/EngineeringDashboard'
import axios from 'axios'
import { toast } from 'sonner'

function EngineeringPortal() {
  const { user } = useUser()
  const [userBranches, setUserBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBranchSelector, setShowBranchSelector] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserBranches()
    }
  }, [user])

  const fetchUserBranches = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/engineering-branches?action=user-branches')
      const branches = response.data.branches || []
      setUserBranches(branches)
      
      // Set primary branch as selected, or first branch if no primary
      const primaryBranch = branches.find(b => b.isPrimary) || branches[0]
      setSelectedBranch(primaryBranch)
      
      // Show branch selector if no branches enrolled
      if (branches.length === 0) {
        setShowBranchSelector(true)
      }
    } catch (error) {
      console.error('Failed to fetch user branches:', error)
      toast.error('Failed to load branches')
      setShowBranchSelector(true)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchEnrolled = (newBranch) => {
    setUserBranches(prev => [...prev, newBranch])
    setSelectedBranch(newBranch)
    setShowBranchSelector(false)
    toast.success(`Enrolled in ${newBranch.branchName}!`)
  }

  const getBranchIcon = (branchCode) => {
    const icons = {
      'CSE': Cpu,
      'IT': Cpu,
      'ECE': Zap,
      'EEE': Zap,
      'MECH': Cog,
      'CIVIL': Building,
      'AERO': Wrench,
      'CHEM': Calculator
    }
    return icons[branchCode] || BookOpen
  }

  const getBranchColor = (branchCode) => {
    const colors = {
      'CSE': 'bg-blue-500',
      'IT': 'bg-indigo-500',
      'ECE': 'bg-yellow-500',
      'EEE': 'bg-orange-500',
      'MECH': 'bg-gray-500',
      'CIVIL': 'bg-green-500',
      'AERO': 'bg-purple-500',
      'CHEM': 'bg-red-500'
    }
    return colors[branchCode] || 'bg-blue-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading Engineering Portal...</p>
        </div>
      </div>
    )
  }

  if (showBranchSelector || userBranches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Engineering Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your comprehensive AI-powered platform for engineering education with branch-specific tools, 
              previous year papers, mock exams, and career guidance.
            </p>
          </div>
          
          <BranchSelector onBranchSelected={handleBranchEnrolled} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${getBranchColor(selectedBranch?.branchCode)} text-white`}>
                  {React.createElement(getBranchIcon(selectedBranch?.branchCode), { className: "h-6 w-6" })}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedBranch?.branchName}</h1>
                  <p className="text-sm text-gray-600">Semester {selectedBranch?.semester}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userBranches.length > 1 && (
                <select 
                  className="border rounded-lg px-3 py-2"
                  value={selectedBranch?.branchCode || ''}
                  onChange={(e) => {
                    const branch = userBranches.find(b => b.branchCode === e.target.value)
                    setSelectedBranch(branch)
                  }}
                >
                  {userBranches.map(branch => (
                    <option key={branch.branchCode} value={branch.branchCode}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setShowBranchSelector(true)}
              >
                Add Branch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <EngineeringDashboard 
          selectedBranch={selectedBranch}
          userBranches={userBranches}
        />
      </div>
    </div>
  )
}

export default EngineeringPortal