"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { 
  Cpu, 
  Zap, 
  Cog, 
  Building, 
  Wrench,
  Calculator,
  CheckCircle,
  Users,
  BookOpen
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

function BranchSelector({ onBranchSelected }) {
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [semester, setSemester] = useState('1')
  const [academicYear, setAcademicYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchBranches()
    setAcademicYear(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`)
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/engineering-branches')
      setBranches(response.data.branches || [])
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      toast.error('Failed to load branches')
      // Set default branches if API fails
      setBranches(getDefaultBranches())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultBranches = () => [
    {
      branchCode: 'CSE',
      branchName: 'Computer Science Engineering',
      description: 'Software development, algorithms, data structures, AI/ML, web development'
    },
    {
      branchCode: 'IT',
      branchName: 'Information Technology',
      description: 'Software systems, networking, database management, cybersecurity'
    },
    {
      branchCode: 'ECE',
      branchName: 'Electronics & Communication',
      description: 'Circuit design, signal processing, communication systems, embedded systems'
    },
    {
      branchCode: 'EEE',
      branchName: 'Electrical & Electronics',
      description: 'Power systems, control systems, electrical machines, renewable energy'
    },
    {
      branchCode: 'MECH',
      branchName: 'Mechanical Engineering',
      description: 'Thermodynamics, fluid mechanics, manufacturing, automotive engineering'
    },
    {
      branchCode: 'CIVIL',
      branchName: 'Civil Engineering',
      description: 'Structural engineering, construction, transportation, environmental engineering'
    }
  ]

  const handleEnroll = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch')
      return
    }

    try {
      setEnrolling(true)
      const response = await axios.post('/api/engineering-branches', {
        action: 'enroll',
        branchCode: selectedBranch,
        semester: parseInt(semester),
        academicYear,
        isPrimary: true
      })

      if (response.data.success) {
        const branch = branches.find(b => b.branchCode === selectedBranch)
        onBranchSelected({
          ...branch,
          semester: parseInt(semester),
          isPrimary: true,
          enrollmentDate: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Failed to enroll in branch')
    } finally {
      setEnrolling(false)
    }
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
      'CSE': 'from-blue-500 to-blue-600',
      'IT': 'from-indigo-500 to-indigo-600',
      'ECE': 'from-yellow-500 to-yellow-600',
      'EEE': 'from-orange-500 to-orange-600',
      'MECH': 'from-gray-500 to-gray-600',
      'CIVIL': 'from-green-500 to-green-600',
      'AERO': 'from-purple-500 to-purple-600',
      'CHEM': 'from-red-500 to-red-600'
    }
    return colors[branchCode] || 'from-blue-500 to-blue-600'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading branches...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose Your Engineering Branch</h2>
        <p className="text-gray-600">Select your branch to access specialized content, tools, and resources</p>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {branches.map((branch) => {
          const Icon = getBranchIcon(branch.branchCode)
          const isSelected = selectedBranch === branch.branchCode
          
          return (
            <Card 
              key={branch.branchCode}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => setSelectedBranch(branch.branchCode)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getBranchColor(branch.branchCode)} flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  {branch.branchName}
                  {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{branch.description}</p>
                <Badge variant="outline" className="text-xs">
                  {branch.branchCode}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enrollment Form */}
      {selectedBranch && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Enrollment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Academic Year</label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full"
              size="lg"
            >
              {enrolling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enroll in {branches.find(b => b.branchCode === selectedBranch)?.branchName}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BranchSelector