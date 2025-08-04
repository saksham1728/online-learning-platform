"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Code, 
  Zap, 
  Wrench, 
  Building, 
  Lightbulb,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Users,
  Settings,
  Plus,
  User
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function EngineeringDashboard() {
  const [userBranches, setUserBranches] = useState([])
  const [primaryBranch, setPrimaryBranch] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    practiceHours: 0
  })
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUserBranches()
      fetchUserStats()
    }
  }, [user])

  const fetchUserBranches = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      
      if (branches.length === 0) {
        // No branch enrollment, redirect to branch selection
        router.push('/workspace/engineering/branch-selection')
        return
      }
      
      setUserBranches(branches)
      const primary = branches.find(b => b.isPrimary) || branches[0]
      setPrimaryBranch(primary)
      
      // Fetch subjects for primary branch
      if (primary) {
        fetchBranchSubjects(primary.branchCode)
      }
    } catch (error) {
      console.error('Failed to fetch user branches:', error)
      toast.error('Failed to load branch information')
      router.push('/workspace/engineering/branch-selection')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranchSubjects = async (branchCode) => {
    try {
      const response = await axios.get(`/api/branch-subjects?branchCode=${branchCode}`)
      if (response.data.success) {
        setSubjects(response.data.subjects || [])
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      // Fetch quiz stats
      const quizResponse = await axios.get('/api/quiz-attempts')
      const attempts = quizResponse.data.attempts || []
      
      // Fetch practice stats
      const practiceResponse = await axios.get('/api/practice-sessions')
      const practiceStats = practiceResponse.data.stats || {}
      
      const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
      const totalMaxScore = attempts.reduce((sum, attempt) => sum + attempt.maxScore, 0)
      const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0
      
      setStats({
        totalQuizzes: attempts.length,
        totalAttempts: attempts.length,
        averageScore: averageScore,
        practiceHours: Math.round((practiceStats.totalQuestions || 0) / 10) // Rough estimate
      })
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
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

  const quickActions = [
    {
      title: 'Generate Quiz',
      description: 'Create AI-powered quizzes',
      icon: FileText,
      href: '/workspace/ai-tools/quiz-generator',
      color: 'bg-blue-500'
    },
    {
      title: 'Practice Mode',
      description: 'Unlimited practice questions',
      icon: Target,
      href: '/workspace/ai-tools/practice',
      color: 'bg-green-500'
    },
    {
      title: 'Question Papers',
      description: 'Previous year papers',
      icon: BookOpen,
      href: '/workspace/question-papers',
      color: 'bg-purple-500'
    },
    {
      title: 'Branch Tools',
      description: 'Specialized engineering tools',
      icon: primaryBranch?.branchCode === 'CSE' ? Code : 
            primaryBranch?.branchCode === 'ECE' ? Zap :
            primaryBranch?.branchCode === 'MECH' ? Wrench :
            primaryBranch?.branchCode === 'CIVIL' ? Building : Lightbulb,
      href: `/workspace/engineering/branch-tools/${primaryBranch?.branchCode?.toLowerCase()}`,
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading your engineering dashboard...</p>
        </div>
      </div>
    )
  }

  if (!primaryBranch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-600">No Branch Selected</h2>
          <p className="text-gray-500">Please select your engineering branch to continue</p>
          <Link href="/workspace/engineering/branch-selection">
            <Button>Select Branch</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getBranchColor(primaryBranch.branchCode)} rounded-xl p-8 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getBranchIcon(primaryBranch.branchCode)}
            <div>
              <h1 className="text-3xl font-bold">Welcome back!</h1>
              <p className="text-xl opacity-90">{primaryBranch.branchName}</p>
              <p className="opacity-75">Semester {primaryBranch.semester} • {primaryBranch.academicYear}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <div className="opacity-75">Average Score</div>
            </div>
            <Link href="/workspace/profile">
              <Button variant="secondary" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <div className="text-sm text-gray-600">Quizzes Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.practiceHours}h</div>
                <div className="text-sm text-gray-600">Practice Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group">
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Semester Subjects</span>
              <Badge variant="outline">Semester {primaryBranch.semester}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjects.filter(s => s.semester === primaryBranch.semester).slice(0, 6).map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{subject.subjectName}</div>
                    <div className="text-sm text-gray-600">{subject.subjectCode} • {subject.credits} Credits</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {subject.isCore && <Badge variant="secondary" className="text-xs">Core</Badge>}
                    <Progress value={Math.random() * 100} className="w-16 h-2" />
                  </div>
                </div>
              ))}
              {subjects.filter(s => s.semester === primaryBranch.semester).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No subjects found for current semester</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-medium">Quiz completed</div>
                  <div className="text-sm text-gray-600">Data Structures - Score: 85%</div>
                </div>
                <div className="text-xs text-gray-500">2h ago</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <div className="font-medium">Practice session</div>
                  <div className="text-sm text-gray-600">Algorithms - 15 questions</div>
                </div>
                <div className="text-xs text-gray-500">1d ago</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="font-medium">Question paper viewed</div>
                  <div className="text-sm text-gray-600">OS 2023 Paper</div>
                </div>
                <div className="text-xs text-gray-500">2d ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Tools Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Specialized Tools for {primaryBranch.branchCode}</span>
            <Link href={`/workspace/engineering/branch-tools/${primaryBranch.branchCode.toLowerCase()}`}>
              <Button variant="outline" size="sm">
                View All Tools
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {JSON.parse(primaryBranch.toolsAvailable || '[]').map((tool, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  {getBranchIcon(primaryBranch.branchCode)}
                  <div>
                    <div className="font-medium">{tool}</div>
                    <div className="text-sm text-gray-600">Specialized tool</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EngineeringDashboard