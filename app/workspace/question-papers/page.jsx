"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Download, Eye, Calendar, University, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
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

  // Sample question papers data (in real app, this would come from database)
  const samplePapers = [
    {
      id: 1,
      title: 'Data Structures and Algorithms',
      subjectCode: 'CS301',
      year: 2023,
      semester: 'Semester 3',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/dsa-2023.pdf',
      downloadCount: 1250
    },
    {
      id: 2,
      title: 'Operating Systems',
      subjectCode: 'CS501',
      year: 2023,
      semester: 'Semester 5',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/os-2023.pdf',
      downloadCount: 980
    },
    {
      id: 3,
      title: 'Database Management Systems',
      subjectCode: 'CS401',
      year: 2023,
      semester: 'Semester 4',
      university: 'VTU',
      branch: 'CSE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/dbms-2023.pdf',
      downloadCount: 1100
    },
    {
      id: 4,
      title: 'Circuit Analysis',
      subjectCode: 'EC101',
      year: 2023,
      semester: 'Semester 1',
      university: 'VTU',
      branch: 'ECE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/circuits-2023.pdf',
      downloadCount: 850
    },
    {
      id: 5,
      title: 'Digital Electronics',
      subjectCode: 'EC301',
      year: 2023,
      semester: 'Semester 3',
      university: 'VTU',
      branch: 'ECE',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/digital-2023.pdf',
      downloadCount: 720
    },
    {
      id: 6,
      title: 'Thermodynamics',
      subjectCode: 'ME201',
      year: 2023,
      semester: 'Semester 2',
      university: 'VTU',
      branch: 'MECH',
      examType: 'Regular',
      marks: 100,
      duration: '3 hours',
      pdfUrl: '/sample-papers/thermo-2023.pdf',
      downloadCount: 650
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
      // In real app, this would be an API call
      // const response = await axios.get('/api/question-papers')
      // setPapers(response.data.papers || [])
      
      // For now, using sample data
      setPapers(samplePapers)
    } catch (error) {
      console.error('Failed to load question papers:', error)
      toast.error('Failed to load question papers')
    } finally {
      setLoading(false)
    }
  }

  const filterPapers = () => {
    let filtered = papers // Start with all papers, no automatic branch filtering

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
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
    try {
      // Create a download link and trigger download
      const link = document.createElement('a')
      link.href = paper.pdfUrl
      link.download = `${paper.title}-${paper.year}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Downloading ${paper.title}...`)
      
      // Track download (in real app, this would be an API call)
      console.log(`Downloaded: ${paper.title}`)
    } catch (error) {
      toast.error('Failed to download the paper')
      console.error('Download error:', error)
    }
  }

  const handleView = (paper) => {
    try {
      // Open PDF in new tab for viewing
      window.open(paper.pdfUrl, '_blank')
      toast.success(`Opening ${paper.title} for preview...`)
    } catch (error) {
      toast.error('Failed to open the paper')
      console.error('View error:', error)
    }
  }



  // Get unique values for filters
  const availableYears = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a)
  const availableSubjects = [...new Set(papers.map(p => p.subjectCode))] // Show all subjects from all branches
  const availableUniversities = [...new Set(papers.map(p => p.university))]

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
      <div className="flex flex-col space-y-4">
        <Link href="/workspace">
          <Button variant="outline" size="sm" className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Question Papers</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Previous year question papers for all engineering branches
          </p>
        </div>
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