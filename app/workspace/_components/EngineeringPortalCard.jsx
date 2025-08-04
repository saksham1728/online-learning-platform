"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { GraduationCap, Code, Zap, Wrench, Building, Lightbulb, ArrowRight, BookOpen, FileText, Target, User, Briefcase } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'

function EngineeringPortalCard() {
  const [userBranch, setUserBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      checkBranchEnrollment()
    }
  }, [user])

  const checkBranchEnrollment = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      const primary = branches.find(b => b.isPrimary) || branches[0]
      setUserBranch(primary)
    } catch (error) {
      console.error('Failed to fetch user branch:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBranchIcon = (branchCode) => {
    switch (branchCode) {
      case 'CSE': return <Code className="h-8 w-8 text-blue-500" />
      case 'ECE': return <Zap className="h-8 w-8 text-yellow-500" />
      case 'MECH': return <Wrench className="h-8 w-8 text-gray-600" />
      case 'CIVIL': return <Building className="h-8 w-8 text-orange-500" />
      case 'EEE': return <Lightbulb className="h-8 w-8 text-green-500" />
      default: return <GraduationCap className="h-8 w-8 text-purple-500" />
    }
  }

  const getBranchColor = (branchCode) => {
    switch (branchCode) {
      case 'CSE': return 'from-blue-500 to-blue-600'
      case 'ECE': return 'from-yellow-500 to-yellow-600'
      case 'MECH': return 'from-gray-500 to-gray-600'
      case 'CIVIL': return 'from-orange-500 to-orange-600'
      case 'EEE': return 'from-green-500 to-green-600'
      default: return 'from-purple-500 to-purple-600'
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>Engineering Portal</span>
          {userBranch && (
            <Badge variant="outline">{userBranch.branchCode}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!userBranch ? (
          <div className="text-center py-6">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">Choose Your Engineering Branch</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select your engineering specialization to access branch-specific content and tools
            </p>
            <Link href="/workspace/engineering/dashboard">
              <Button className="w-full">
                Select Branch
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Branch Info */}
            <div className={`bg-gradient-to-r ${getBranchColor(userBranch.branchCode)} rounded-lg p-4 text-white`}>
              <div className="flex items-center space-x-3">
                {getBranchIcon(userBranch.branchCode)}
                <div>
                  <h3 className="font-semibold">{userBranch.branchName}</h3>
                  <p className="text-sm opacity-90">Semester {userBranch.semester}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/workspace/engineering/dashboard">
                <Button variant="outline" size="sm" className="w-full">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/workspace/question-papers">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Papers
                </Button>
              </Link>
              <Link href="/workspace/mock-exams">
                <Button variant="outline" size="sm" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Mock Exams
                </Button>
              </Link>
              <Link href="/workspace/code-editor">
                <Button variant="outline" size="sm" className="w-full">
                  <Code className="h-4 w-4 mr-2" />
                  Code Editor
                </Button>
              </Link>
              <Link href="/workspace/engineering/career-services">
                <Button variant="outline" size="sm" className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Career
                </Button>
              </Link>
            </div>

            <Link href="/workspace/engineering/dashboard">
              <Button className="w-full">
                Open Engineering Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EngineeringPortalCard