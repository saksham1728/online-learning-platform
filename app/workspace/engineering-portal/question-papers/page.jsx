"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Download, Eye, Calendar, University, FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function QuestionPapers() {
  const [papers, setPapers] = useState([])
  const [filteredPapers, setFilteredPapers] = useState([])
  const [userBranch, setUserBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedUniversity, setSelectedUniversity] = useState('all')
  const { user } = useUser()

  // Real sample question papers data with actual technical content
  const samplePapers = [
    {
      id: 1,
      paperId: 'CSE301-2023-VTU',
      title: 'Object Oriented Programming with Java',
      subjectCode: 'CS301',
      subjectName: 'Object Oriented Programming with Java',
      year: 2023,
      semester: 'Semester 3',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/oops-2023.pdf',
      downloadCount: 1250,
      difficultyLevel: 'Medium',
      questions: [
        {
          id: 1,
          question: "Explain the concept of inheritance in Java with an example. Discuss the types of inheritance supported by Java.",
          marks: 10,
          type: "long_answer"
        },
        {
          id: 2,
          question: "What is polymorphism? Differentiate between compile-time and runtime polymorphism with suitable Java code examples.",
          marks: 10,
          type: "long_answer"
        },
        {
          id: 3,
          question: "Write a Java program to demonstrate method overloading and method overriding.",
          marks: 15,
          type: "programming"
        }
      ]
    },
    {
      id: 2,
      paperId: 'CSE601-2023-VTU',
      title: 'Computer Networks',
      subjectCode: 'CS601',
      subjectName: 'Computer Networks',
      year: 2023,
      semester: 'Semester 6',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/cn-2023.pdf',
      downloadCount: 980,
      difficultyLevel: 'Hard',
      questions: [
        {
          id: 1,
          question: "Explain the OSI reference model with its seven layers. Discuss the functions of each layer with examples.",
          marks: 15,
          type: "long_answer"
        },
        {
          id: 2,
          question: "What is TCP/IP protocol suite? Compare TCP and UDP protocols with their applications.",
          marks: 10,
          type: "long_answer"
        },
        {
          id: 3,
          question: "Describe different routing algorithms: Distance Vector and Link State routing with examples.",
          marks: 15,
          type: "long_answer"
        }
      ]
    },
    {
      id: 3,
      paperId: 'CSE401-2023-VTU',
      title: 'Database Management Systems',
      subjectCode: 'CS401',
      subjectName: 'Database Management Systems',
      year: 2023,
      semester: 'Semester 4',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/dbms-2023.pdf',
      downloadCount: 1100,
      difficultyLevel: 'Medium',
      questions: [
        {
          id: 1,
          question: "Explain the concept of normalization in databases. Discuss 1NF, 2NF, 3NF, and BCNF with examples.",
          marks: 15,
          type: "long_answer"
        },
        {
          id: 2,
          question: "Write SQL queries for the following: a) Create a table 'Employee' with constraints b) Insert data c) Update salary d) Delete records",
          marks: 15,
          type: "programming"
        },
        {
          id: 3,
          question: "What are ACID properties in database transactions? Explain with examples.",
          marks: 10,
          type: "long_answer"
        }
      ]
    },
    {
      id: 4,
      paperId: 'CSE701-2023-VTU',
      title: 'JavaScript and Web Technologies',
      subjectCode: 'CS701',
      subjectName: 'JavaScript and Web Technologies',
      year: 2023,
      semester: 'Semester 7',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/js-2023.pdf',
      downloadCount: 850,
      difficultyLevel: 'Medium',
      questions: [
        {
          id: 1,
          question: "Explain JavaScript closures and scope. Write a program to demonstrate closure with practical examples.",
          marks: 15,
          type: "programming"
        },
        {
          id: 2,
          question: "What are Promises in JavaScript? Compare Promises with async/await. Write code examples.",
          marks: 15,
          type: "programming"
        },
        {
          id: 3,
          question: "Explain DOM manipulation in JavaScript. Write a program to dynamically create and modify HTML elements.",
          marks: 10,
          type: "programming"
        }
      ]
    },
    // Add more years for the same subjects
    {
      id: 5,
      paperId: 'CSE301-2022-VTU',
      title: 'Object Oriented Programming with Java',
      subjectCode: 'CS301',
      subjectName: 'Object Oriented Programming with Java',
      year: 2022,
      semester: 'Semester 3',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/oops-2022.pdf',
      downloadCount: 890,
      difficultyLevel: 'Medium'
    },
    {
      id: 6,
      paperId: 'CSE601-2022-VTU',
      title: 'Computer Networks',
      subjectCode: 'CS601',
      subjectName: 'Computer Networks',
      year: 2022,
      semester: 'Semester 6',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/cn-2022.pdf',
      downloadCount: 756,
      difficultyLevel: 'Hard'
    },
    {
      id: 7,
      paperId: 'CSE401-2022-VTU',
      title: 'Database Management Systems',
      subjectCode: 'CS401',
      subjectName: 'Database Management Systems',
      year: 2022,
      semester: 'Semester 4',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/dbms-2022.pdf',
      downloadCount: 920,
      difficultyLevel: 'Medium'
    },
    {
      id: 8,
      paperId: 'CSE701-2022-VTU',
      title: 'JavaScript and Web Technologies',
      subjectCode: 'CS701',
      subjectName: 'JavaScript and Web Technologies',
      year: 2022,
      semester: 'Semester 7',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/js-2022.pdf',
      downloadCount: 680,
      difficultyLevel: 'Medium'
    },
    {
      id: 9,
      paperId: 'CSE301-2021-VTU',
      title: 'Object Oriented Programming with Java',
      subjectCode: 'CS301',
      subjectName: 'Object Oriented Programming with Java',
      year: 2021,
      semester: 'Semester 3',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/oops-2021.pdf',
      downloadCount: 756,
      difficultyLevel: 'Hard'
    },
    {
      id: 10,
      paperId: 'CSE601-2021-VTU',
      title: 'Computer Networks',
      subjectCode: 'CS601',
      subjectName: 'Computer Networks',
      year: 2021,
      semester: 'Semester 6',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/cn-2021.pdf',
      downloadCount: 650,
      difficultyLevel: 'Hard'
    },
    {
      id: 11,
      paperId: 'CSE401-2021-VTU',
      title: 'Database Management Systems',
      subjectCode: 'CS401',
      subjectName: 'Database Management Systems',
      year: 2021,
      semester: 'Semester 4',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/dbms-2021.pdf',
      downloadCount: 820,
      difficultyLevel: 'Medium'
    },
    {
      id: 12,
      paperId: 'CSE701-2021-VTU',
      title: 'JavaScript and Web Technologies',
      subjectCode: 'CS701',
      subjectName: 'JavaScript and Web Technologies',
      year: 2021,
      semester: 'Semester 7',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/js-2021.pdf',
      downloadCount: 580,
      difficultyLevel: 'Medium'
    }
  ]

  useEffect(() => {
    if (user) {
      fetchUserBranch()
      loadQuestionPapers()
    }
  }, [user])

  useEffect(() => {
    filterPapers()
  }, [papers, searchTerm, selectedYear, selectedSubject, selectedUniversity, userBranch])

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

  const loadQuestionPapers = async () => {
    try {
      setLoading(true)
      // Fetch from database
      const response = await axios.get('/api/question-papers')
      const dbPapers = response.data.papers || []
      
      // If no papers in database, use sample data
      if (dbPapers.length === 0) {
        setPapers(samplePapers)
      } else {
        // Transform database papers to match expected format
        const transformedPapers = dbPapers.map(paper => ({
          id: paper.id,
          paperId: paper.paperId,
          title: paper.subjectName,
          subjectCode: paper.subjectCode,
          subjectName: paper.subjectName,
          year: paper.examYear,
          semester: `Semester ${Math.ceil(paper.examYear % 8) || 1}`, // Estimate semester
          university: paper.university || 'VTU',
          branch: paper.branchCode,
          examType: paper.examType || 'Regular',
          marks: paper.totalMarks || 100,
          duration: `${Math.floor((paper.durationMinutes || 180) / 60)} hours`,
          pdfUrl: paper.pdfUrl,
          downloadCount: paper.downloadCount || 0,
          difficultyLevel: paper.difficultyLevel || 'Medium'
        }))
        setPapers(transformedPapers)
      }
    } catch (error) {
      console.error('Failed to load question papers:', error)
      // Fallback to sample data
      setPapers(samplePapers)
      toast.error('Failed to load question papers from database, showing sample data')
    } finally {
      setLoading(false)
    }
  }

  const filterPapers = () => {
    let filtered = papers

    // Filter by user's branch first
    if (userBranch) {
      filtered = filtered.filter(paper => paper.branch === userBranch.branchCode)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(paper => paper.year.toString() === selectedYear)
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(paper => paper.subjectCode === selectedSubject)
    }

    // University filter
    if (selectedUniversity !== 'all') {
      filtered = filtered.filter(paper => paper.university === selectedUniversity)
    }

    setFilteredPapers(filtered)
  }

  const handleDownload = (paper) => {
    // Create a sample PDF download
    const pdfContent = `Question Paper: ${paper.title}\n\nYear: ${paper.year}\nSubject: ${paper.subjectCode}\nUniversity: ${paper.university}\nDuration: ${paper.duration}\nMarks: ${paper.marks}\n\nThis is a sample question paper. In a real implementation, this would be the actual PDF content.`
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${paper.subjectCode}_${paper.year}_QuestionPaper.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded ${paper.title} (${paper.year})`)
    
    // Update download count
    setPapers(prev => prev.map(p => 
      p.id === paper.id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p
    ))
  }

  const handleView = (paper) => {
    // Open a new window with paper preview
    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paper.title} - Preview</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .question { margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${paper.title}</h1>
          <p><strong>Subject Code:</strong> ${paper.subjectCode} | <strong>Year:</strong> ${paper.year} | <strong>University:</strong> ${paper.university}</p>
        </div>
        <div class="info">
          <p><strong>Duration:</strong> ${paper.duration || '3 hours'} | <strong>Total Marks:</strong> ${paper.marks || paper.totalMarks || 100}</p>
          <p><strong>Difficulty:</strong> ${paper.difficultyLevel || 'Medium'} | <strong>Exam Type:</strong> ${paper.examType || 'Regular'}</p>
        </div>
        <div class="content">
          <h3>Sample Questions:</h3>
          <div class="question">
            <h4>Question 1: (10 marks)</h4>
            <p>Explain the fundamental concepts covered in ${paper.title}. Discuss the key principles and their applications.</p>
          </div>
          <div class="question">
            <h4>Question 2: (15 marks)</h4>
            <p>Solve the following problem related to ${paper.subjectCode}. Show all steps and provide detailed explanations.</p>
          </div>
          <div class="question">
            <h4>Question 3: (20 marks)</h4>
            <p>Compare and contrast different approaches in ${paper.title}. Provide examples and justify your analysis.</p>
          </div>
          <p><em>Note: This is a sample preview. The actual question paper would contain the complete set of questions.</em></p>
        </div>
      </body>
      </html>
    `
    
    const newWindow = window.open('', '_blank')
    newWindow.document.write(previewContent)
    newWindow.document.close()
    
    toast.info(`Opened ${paper.title} for preview`)
  }

  const convertToQuiz = (paper) => {
    // Navigate to quiz generator with paper context
    const quizData = {
      title: `Quiz from ${paper.title}`,
      subject: paper.subjectCode,
      year: paper.year,
      difficulty: paper.difficultyLevel || 'Medium',
      source: 'question-paper',
      paperId: paper.id
    }
    
    // Store quiz data in localStorage for the quiz generator to use
    localStorage.setItem('pendingQuizGeneration', JSON.stringify(quizData))
    
    // Navigate to quiz generator
    window.open('/workspace/ai-tools/quiz-generator', '_blank')
    
    toast.success(`Converting ${paper.title} to interactive quiz...`)
  }

  const generateMockExam = (papers) => {
    if (papers.length < 2) {
      toast.error('Need at least 2 papers to generate mock exam')
      return
    }
    toast.success('Generating mock exam from selected papers...')
    // In real app: router.push(`/workspace/engineering-portal/mock-exams/generate?papers=${papers.map(p => p.id).join(',')}`)
  }

  // Get unique values for filters
  const availableYears = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a)
  const availableSubjects = [...new Set(papers.filter(p => !userBranch || p.branch === userBranch.branchCode).map(p => p.subjectCode))]
  const availableUniversities = [...new Set(papers.map(p => p.university))]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading question papers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering-portal/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Question Papers</h1>
            <p className="text-gray-600">
              Previous year question papers for {userBranch?.branchName || 'Engineering'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => generateMockExam(filteredPapers)}
            disabled={filteredPapers.length < 2}
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Mock Exam
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredPapers.length}</div>
            <div className="text-sm text-gray-600">Available Papers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{availableYears.length}</div>
            <div className="text-sm text-gray-600">Years Covered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{availableSubjects.length}</div>
            <div className="text-sm text-gray-600">Subjects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Math.round(filteredPapers.reduce((sum, p) => sum + p.downloadCount, 0) / filteredPapers.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Downloads</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {availableUniversities.map(uni => (
                  <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setSelectedYear('all')
              setSelectedSubject('all')
              setSelectedUniversity('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((paper) => (
          <Card key={paper.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{paper.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{paper.subjectCode}</Badge>
                    <Badge variant="secondary">{paper.year}</Badge>
                    <Badge className={getDifficultyColor(paper.difficultyLevel)}>
                      {paper.difficultyLevel}
                    </Badge>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <University className="h-4 w-4 text-gray-500" />
                  <span>{paper.university}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{paper.semester}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{paper.marks} Marks</span>
                <span>{paper.duration}</span>
                <span>{paper.downloadCount} downloads</span>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleView(paper)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDownload(paper)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => convertToQuiz(paper)}
                className="w-full"
              >
                Convert to Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Question Papers Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedYear !== 'all' || selectedSubject !== 'all' || selectedUniversity !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Question papers for your branch will be available soon.'}
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedYear('all')
                setSelectedSubject('all')
                setSelectedUniversity('all')
              }}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default QuestionPapers