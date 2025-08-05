"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Badge } from '../../../../components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar,
  Building,
  Clock,
  Award,
  Eye,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'sonner'

function QuestionPapersContent() {
  const searchParams = useSearchParams()
  const branchCode = searchParams.get('branch')
  
  const [papers, setPapers] = useState([])
  const [filters, setFilters] = useState({
    subjects: [],
    years: [],
    universities: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedUniversity, setSelectedUniversity] = useState('all')

  useEffect(() => {
    fetchQuestionPapers()
  }, [branchCode, selectedSubject, selectedYear, selectedUniversity, searchTerm])

  const fetchQuestionPapers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (branchCode) params.append('branch', branchCode)
      if (selectedSubject !== 'all') params.append('subject', selectedSubject)
      if (selectedYear !== 'all') params.append('year', selectedYear)
      if (selectedUniversity !== 'all') params.append('university', selectedUniversity)
      if (searchTerm) params.append('search', searchTerm)

      const response = await axios.get(`/api/question-papers?${params.toString()}`)
      
      if (response.data.success) {
        setPapers(response.data.papers || [])
        setFilters(response.data.filters || { subjects: [], years: [], universities: [] })
      }
    } catch (error) {
      console.error('Failed to fetch question papers:', error)
      toast.error('Failed to load question papers')
      // Set sample data for demo
      setSampleData()
    } finally {
      setLoading(false)
    }
  }

  const setSampleData = () => {
    const samplePapers = [
      {
        paperId: 'sample1',
        branchCode: branchCode || 'CSE',
        subjectCode: 'CS101',
        subjectName: 'Data Structures and Algorithms',
        university: 'Anna University',
        examYear: 2023,
        examType: 'semester',
        totalMarks: 100,
        durationMinutes: 180,
        downloadCount: 245,
        uploadDate: '2023-12-01'
      },
      {
        paperId: 'sample2',
        branchCode: branchCode || 'CSE',
        subjectCode: 'CS102',
        subjectName: 'Database Management Systems',
        university: 'VTU',
        examYear: 2023,
        examType: 'semester',
        totalMarks: 100,
        durationMinutes: 180,
        downloadCount: 189,
        uploadDate: '2023-11-15'
      },
      {
        paperId: 'sample3',
        branchCode: branchCode || 'CSE',
        subjectCode: 'CS103',
        subjectName: 'Computer Networks',
        university: 'JNTU',
        examYear: 2022,
        examType: 'semester',
        totalMarks: 100,
        durationMinutes: 180,
        downloadCount: 156,
        uploadDate: '2023-10-20'
      }
    ]
    
    setPapers(samplePapers)
    setFilters({
      subjects: [
        { subjectCode: 'CS101', subjectName: 'Data Structures and Algorithms' },
        { subjectCode: 'CS102', subjectName: 'Database Management Systems' },
        { subjectCode: 'CS103', subjectName: 'Computer Networks' }
      ],
      years: [2023, 2022, 2021, 2020],
      universities: ['Anna University', 'VTU', 'JNTU', 'AKTU']
    })
  }

  const handleDownload = async (paper) => {
    // In a real implementation, this would download the actual PDF
    toast.success(`Downloading ${paper.subjectName} (${paper.examYear})`)
    
    // Update download count (in real app, this would be an API call)
    setPapers(prev => prev.map(p => 
      p.paperId === paper.paperId 
        ? { ...p, downloadCount: p.downloadCount + 1 }
        : p
    ))
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

  const getExamTypeColor = (type) => {
    const colors = {
      'semester': 'bg-blue-100 text-blue-800',
      'annual': 'bg-green-100 text-green-800',
      'supplementary': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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
          <Link href="/workspace/engineering">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Engineering
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Question Papers</h1>
            <p className="text-gray-600">
              {branchCode ? getBranchName(branchCode) : 'All Branches'} - Previous Year Papers
            </p>
          </div>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Paper
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {filters.subjects.map((subject) => (
                  <SelectItem key={subject.subjectCode} value={subject.subjectCode}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filters.years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {filters.universities.map((university) => (
                  <SelectItem key={university} value={university}>
                    {university}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found {papers.length} question papers
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select defaultValue="year-desc">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year-desc">Year (Newest)</SelectItem>
              <SelectItem value="year-asc">Year (Oldest)</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Papers Grid */}
      {papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Card key={paper.paperId} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {paper.subjectName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {paper.subjectCode}
                    </p>
                  </div>
                  <Badge className={getExamTypeColor(paper.examType)}>
                    {paper.examType}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{paper.examYear}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{paper.university}</span>
                  </div>
                  {paper.totalMarks && (
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>{paper.totalMarks} marks</span>
                    </div>
                  )}
                  {paper.durationMinutes && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{paper.durationMinutes} min</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Download className="h-4 w-4" />
                    <span>{paper.downloadCount} downloads</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(paper)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Question Papers Found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedSubject !== 'all' || selectedYear !== 'all' 
                ? 'Try adjusting your search filters'
                : 'Be the first to upload question papers for this branch'
              }
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload First Paper
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function QuestionPapersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading question papers...</p>
        </div>
      </div>
    }>
      <QuestionPapersContent />
    </Suspense>
  )
}

export default QuestionPapersPage