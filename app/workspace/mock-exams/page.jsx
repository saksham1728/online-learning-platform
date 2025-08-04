"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Play, Clock, Award, Target, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Progress } from '../../../components/ui/progress'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function MockExams() {
  const [userBranch, setUserBranch] = useState(null)
  const [mockExams, setMockExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const { user } = useUser()

  // Sample mock exams data
  const sampleMockExams = [
    {
      id: 1,
      title: 'Data Structures Mid-term Mock',
      subject: 'Data Structures',
      subjectCode: 'CS301',
      difficulty: 'Medium',
      questions: 30,
      duration: 90, // minutes
      totalMarks: 100,
      attempts: 1250,
      averageScore: 72,
      basedOnYears: [2020, 2021, 2022, 2023],
      tags: ['Arrays', 'Linked Lists', 'Trees', 'Graphs'],
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Operating Systems Final Mock',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      difficulty: 'Hard',
      questions: 40,
      duration: 120,
      totalMarks: 150,
      attempts: 890,
      averageScore: 65,
      basedOnYears: [2019, 2020, 2021, 2022, 2023],
      tags: ['Process Management', 'Memory Management', 'File Systems'],
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      title: 'Database Quick Assessment',
      subject: 'Database Management',
      subjectCode: 'CS401',
      difficulty: 'Easy',
      questions: 20,
      duration: 45,
      totalMarks: 50,
      attempts: 1580,
      averageScore: 78,
      basedOnYears: [2021, 2022, 2023],
      tags: ['SQL', 'Normalization', 'ER Diagrams'],
      createdAt: '2024-01-20'
    },
    {
      id: 4,
      title: 'Circuit Analysis Comprehensive',
      subject: 'Circuit Analysis',
      subjectCode: 'EC101',
      difficulty: 'Medium',
      questions: 25,
      duration: 75,
      totalMarks: 80,
      attempts: 650,
      averageScore: 69,
      basedOnYears: [2020, 2021, 2022, 2023],
      tags: ['AC Circuits', 'DC Circuits', 'Network Theorems'],
      createdAt: '2024-01-12'
    },
    {
      id: 5,
      title: 'Digital Electronics Practice',
      subject: 'Digital Electronics',
      subjectCode: 'EC301',
      difficulty: 'Medium',
      questions: 35,
      duration: 100,
      totalMarks: 120,
      attempts: 720,
      averageScore: 71,
      basedOnYears: [2021, 2022, 2023],
      tags: ['Logic Gates', 'Flip Flops', 'Counters'],
      createdAt: '2024-01-18'
    }
  ]

  useEffect(() => {
    if (user) {
      fetchUserBranch()
      loadMockExams()
    }
  }, [user])

  useEffect(() => {
    filterExams()
  }, [mockExams, searchTerm, selectedSubject, selectedDifficulty, userBranch])

  const fetchUserBranch = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      const primary = branches.find(b => b.isPrimary) || branches[0]
      setUserBranch(primary)
    } catch (error) {
      console.error('Failed to fetch user branch:', error)
    }
  }

  const loadMockExams = async () => {
    try {
      setLoading(true)
      // In real app, this would be an API call
      // const response = await axios.get('/api/mock-exams')
      // setMockExams(response.data.exams || [])
      
      // For now, using sample data
      setMockExams(sampleMockExams)
    } catch (error) {
      console.error('Failed to load mock exams:', error)
      toast.error('Failed to load mock exams')
    } finally {
      setLoading(false)
    }
  }

  const filterExams = () => {
    let filtered = mockExams

    // Filter by user's branch subjects
    if (userBranch) {
      // This would filter based on branch subjects in real implementation
      const branchSubjects = ['CS301', 'CS401', 'CS501', 'EC101', 'EC301'] // Sample
      filtered = filtered.filter(exam => 
        userBranch.branchCode === 'CSE' ? exam.subjectCode.startsWith('CS') :
        userBranch.branchCode === 'ECE' ? exam.subjectCode.startsWith('EC') :
        true
      )
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(exam => exam.subjectCode === selectedSubject)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exam => exam.difficulty === selectedDifficulty)
    }

    setFilteredExams(filtered)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStartExam = (exam) => {
    toast.info(`Starting ${exam.title}...`)
    // In real app, this would navigate to exam interface
  }

  const handleViewResults = (exam) => {
    toast.info(`Viewing results for ${exam.title}...`)
    // In real app, this would show detailed results
  }

  // Get unique values for filters
  const availableSubjects = [...new Set(filteredExams.map(e => e.subjectCode))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading mock exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mock Exams</h1>
            <p className="text-gray-600">
              AI-generated mock exams based on previous year patterns for {userBranch?.branchName || 'Engineering'}
            </p>
          </div>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Create Custom Exam
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{filteredExams.length}</div>
                <div className="text-sm text-gray-600">Available Exams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredExams.reduce((sum, e) => sum + e.duration, 0) / filteredExams.length) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Duration (min)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredExams.reduce((sum, e) => sum + e.averageScore, 0) / filteredExams.length) || 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {filteredExams.reduce((sum, e) => sum + e.attempts, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setSelectedSubject('all')
              setSelectedDifficulty('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mock Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{exam.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{exam.subjectCode}</Badge>
                    <Badge className={getDifficultyColor(exam.difficulty)}>
                      {exam.difficulty}
                    </Badge>
                  </div>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{exam.duration} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>{exam.totalMarks} marks</span>
                </div>
              </div>
              
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Questions: {exam.questions}</span>
                  <span>Avg Score: {exam.averageScore}%</span>
                </div>
                <Progress value={exam.averageScore} className="h-2" />
              </div>

              <div className="text-sm">
                <div className="font-medium mb-1">Based on years:</div>
                <div className="flex flex-wrap gap-1">
                  {exam.basedOnYears.map(year => (
                    <Badge key={year} variant="secondary" className="text-xs">
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium mb-1">Topics covered:</div>
                <div className="flex flex-wrap gap-1">
                  {exam.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {exam.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{exam.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleStartExam(exam)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Exam
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewResults(exam)}
                  className="flex-1"
                >
                  Results
                </Button>
              </div>

              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{exam.attempts} attempts</span>
                <span>Created: {new Date(exam.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Mock Exams Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedSubject !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Mock exams for your branch will be available soon.'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedSubject('all')
                  setSelectedDifficulty('all')
                }}>
                  Clear All Filters
                </Button>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Create Custom Exam
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MockExams