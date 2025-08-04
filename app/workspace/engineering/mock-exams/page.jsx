"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Badge } from '../../../../components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Award, 
  Users,
  Play,
  BarChart3,
  Target,
  Sparkles,
  FileText,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'sonner'

function MockExamsPage() {
  const searchParams = useSearchParams()
  const branchCode = searchParams.get('branch')
  
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    subjectCode: '',
    subjectName: '',
    difficulty: 'medium',
    questionCount: 10,
    totalMarks: 100,
    duration: 180
  })

  useEffect(() => {
    fetchMockExams()
  }, [branchCode])

  const fetchMockExams = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (branchCode) params.append('branch', branchCode)

      const response = await axios.get(`/api/mock-exams?${params.toString()}`)
      
      if (response.data.success) {
        setExams(response.data.exams || [])
      }
    } catch (error) {
      console.error('Failed to fetch mock exams:', error)
      toast.error('Failed to load mock exams')
      // Set sample data for demo
      setSampleExams()
    } finally {
      setLoading(false)
    }
  }

  const setSampleExams = () => {
    const sampleExams = [
      {
        examId: 'sample1',
        title: 'Data Structures Mock Exam',
        branchCode: branchCode || 'CSE',
        subjectCode: 'CS101',
        totalMarks: 100,
        durationMinutes: 180,
        createdAt: '2023-12-01',
        questions: JSON.stringify([])
      },
      {
        examId: 'sample2',
        title: 'Database Systems Mock Exam',
        branchCode: branchCode || 'CSE',
        subjectCode: 'CS102',
        totalMarks: 100,
        durationMinutes: 180,
        createdAt: '2023-11-15',
        questions: JSON.stringify([])
      }
    ]
    setExams(sampleExams)
  }

  const handleCreateExam = async () => {
    if (!createForm.subjectName.trim()) {
      toast.error('Please enter subject name')
      return
    }

    try {
      setGenerating(true)
      const response = await axios.post('/api/mock-exams', {
        action: 'generate',
        branchCode: branchCode || 'CSE',
        subjectCode: createForm.subjectCode || 'SUB001',
        subjectName: createForm.subjectName,
        difficulty: createForm.difficulty,
        questionCount: createForm.questionCount,
        totalMarks: createForm.totalMarks,
        duration: createForm.duration
      })

      if (response.data.success) {
        toast.success('Mock exam generated successfully!')
        setExams(prev => [response.data.exam, ...prev])
        setShowCreateForm(false)
        setCreateForm({
          subjectCode: '',
          subjectName: '',
          difficulty: 'medium',
          questionCount: 10,
          totalMarks: 100,
          duration: 180
        })
      }
    } catch (error) {
      console.error('Failed to create mock exam:', error)
      toast.error('Failed to generate mock exam')
    } finally {
      setGenerating(false)
    }
  }

  const getBranchName = (code) => {
    const branches = {
      'CSE': 'Computer Science Engineering',
      'IT': 'Information Technology',
      'ECE': 'Electronics & Communication',
      'EEE': 'Electrical & Electronics',
      'MECH': 'Mechanical Engineering',
      'CIVIL': 'Civil Engineering'
    }
    return branches[code] || code
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'hard': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

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
          <Link href="/workspace/engineering">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Engineering
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mock Exams</h1>
            <p className="text-gray-600">
              {branchCode ? getBranchName(branchCode) : 'All Branches'} - AI Generated Mock Exams
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Exam
        </Button>
      </div>

      {/* Create Exam Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Generate AI Mock Exam</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject Name *</label>
                <Input
                  placeholder="e.g., Data Structures and Algorithms"
                  value={createForm.subjectName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subjectName: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject Code</label>
                <Input
                  placeholder="e.g., CS101"
                  value={createForm.subjectCode}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subjectCode: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <Select value={createForm.difficulty} onValueChange={(value) => setCreateForm(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                <Select value={createForm.questionCount.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, questionCount: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total Marks</label>
                <Input
                  type="number"
                  value={createForm.totalMarks}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 100 }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <Input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 180 }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExam} disabled={generating}>
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Exam
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{exams.length}</div>
                <div className="text-sm text-gray-600">Available Exams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Exams Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Grid */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.examId} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {exam.title}
                  </CardTitle>
                  <Badge variant="outline">
                    {exam.subjectCode}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{exam.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>{exam.totalMarks} marks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>
                      {exam.questions ? 
                        (typeof exam.questions === 'string' ? JSON.parse(exam.questions).length : exam.questions.length) 
                        : 0
                      } questions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>0 attempts</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    <Link href={`/workspace/engineering/mock-exams/${exam.examId}`}>
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Start Exam
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Mock Exams Available
            </h3>
            <p className="text-gray-500 mb-6">
              Generate your first AI-powered mock exam to start practicing
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate First Exam
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MockExamsPage