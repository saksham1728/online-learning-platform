"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Download, Eye, Calendar, BookOpen, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'
import QuestionDisplay from '../../../components/notes/QuestionDisplay'

function Notes() {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [extractingQuestions, setExtractingQuestions] = useState({})
  const [showQuestions, setShowQuestions] = useState(false)
  const [extractedQuestions, setExtractedQuestions] = useState([])
  const [questionsSummary, setQuestionsSummary] = useState({})
  const { user } = useUser()

  // Sample notes data (will be replaced with database data)
  const sampleNotes = [
    {
      id: 1,
      noteId: 'note_dsa_001',
      title: 'Data Structures and Algorithms - Complete Notes',
      subject: 'Computer Science',
      subjectCode: 'CS301',
      branch: 'CSE',
      pdfUrl: '/sample-notes/dsa-notes.pdf',
      uploadDate: '2024-01-15',
      downloadCount: 2450,
      pages: 120,
      fileSize: '2.5 MB'
    },
    {
      id: 2,
      noteId: 'note_os_001',
      title: 'Operating Systems Concepts',
      subject: 'Computer Science',
      subjectCode: 'CS501',
      branch: 'CSE',
      pdfUrl: '/sample-notes/os-notes.pdf',
      uploadDate: '2024-01-10',
      downloadCount: 1890,
      pages: 95,
      fileSize: '1.8 MB'
    },
    {
      id: 3,
      noteId: 'note_dbms_001',
      title: 'Database Management Systems',
      subject: 'Computer Science',
      subjectCode: 'CS401',
      branch: 'CSE',
      pdfUrl: '/sample-notes/dbms-notes.pdf',
      uploadDate: '2024-01-08',
      downloadCount: 2100,
      pages: 110,
      fileSize: '2.2 MB'
    },
    {
      id: 4,
      noteId: 'note_circuits_001',
      title: 'Circuit Analysis and Design',
      subject: 'Electronics',
      subjectCode: 'EC101',
      branch: 'ECE',
      pdfUrl: '/sample-notes/circuits-notes.pdf',
      uploadDate: '2024-01-12',
      downloadCount: 1650,
      pages: 85,
      fileSize: '1.9 MB'
    },
    {
      id: 5,
      noteId: 'note_digital_001',
      title: 'Digital Electronics Fundamentals',
      subject: 'Electronics',
      subjectCode: 'EC301',
      branch: 'ECE',
      pdfUrl: '/sample-notes/digital-notes.pdf',
      uploadDate: '2024-01-05',
      downloadCount: 1420,
      pages: 75,
      fileSize: '1.6 MB'
    },
    {
      id: 6,
      noteId: 'note_thermo_001',
      title: 'Thermodynamics and Heat Transfer',
      subject: 'Mechanical Engineering',
      subjectCode: 'ME201',
      branch: 'MECH',
      pdfUrl: '/sample-notes/thermo-notes.pdf',
      uploadDate: '2024-01-03',
      downloadCount: 1280,
      pages: 100,
      fileSize: '2.0 MB'
    }
  ]

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm, selectedSubject, selectedBranch])

  const loadNotes = async () => {
    try {
      setLoading(true)
      // Try to load from API first, fallback to sample data
      try {
        const response = await axios.get('/api/notes')
        if (response.data.success && response.data.notes.length > 0) {
          setNotes(response.data.notes)
        } else {
          // Fallback to sample data if no notes in database
          setNotes(sampleNotes)
        }
      } catch (apiError) {
        console.log('API not available, using sample data')
        setNotes(sampleNotes)
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
      toast.error('Failed to load notes')
      // Still show sample data on error
      setNotes(sampleNotes)
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes // Show all notes by default

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(note => note.subject === selectedSubject)
    }

    // Branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(note => note.branch === selectedBranch)
    }

    setFilteredNotes(filtered)
  }

  const handleDownload = (note) => {
    try {
      // Create a download link and trigger download
      const link = document.createElement('a')
      link.href = note.pdfUrl
      link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Downloading ${note.title}...`)
      
      // Track download (in real app, this would be an API call)
      console.log(`Downloaded: ${note.title}`)
    } catch (error) {
      toast.error('Failed to download the note')
      console.error('Download error:', error)
    }
  }

  const handleView = (note) => {
    try {
      // Open PDF in new tab for viewing
      window.open(note.pdfUrl, '_blank')
      toast.success(`Opening ${note.title} for preview...`)
    } catch (error) {
      toast.error('Failed to open the note')
      console.error('View error:', error)
    }
  }

  const extractQuestions = async (note) => {
    try {
      setExtractingQuestions(prev => ({ ...prev, [note.id]: true }))
      toast.info('Extracting questions from PDF using AI...')
      
      // Call the AI extraction API
      const response = await axios.post('/api/notes/extract-questions', {
        noteId: note.noteId || note.id,
        pdfUrl: note.pdfUrl,
        title: note.title,
        subject: note.subject
      })
      
      if (response.data.success) {
        toast.success(`Successfully extracted ${response.data.questions.length} questions!`)
        setExtractedQuestions(response.data.questions)
        setQuestionsSummary(response.data.summary)
        setShowQuestions(true)
      } else {
        toast.error('Failed to extract questions')
      }
    } catch (error) {
      toast.error('Failed to extract questions from PDF')
      console.error('Question extraction error:', error)
    } finally {
      setExtractingQuestions(prev => ({ ...prev, [note.id]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (size) => {
    return size
  }

  // Get unique values for filters
  const availableSubjects = [...new Set(notes.map(n => n.subject))]
  const availableBranches = [...new Set(notes.map(n => n.branch))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading notes...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Study Notes</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Download study notes and extract practice questions using AI
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
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

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {availableBranches.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setSelectedSubject('all')
              setSelectedBranch('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{note.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{note.subjectCode}</Badge>
                    <Badge variant="secondary">{note.branch}</Badge>
                  </div>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>{note.pages} pages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(note.uploadDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatFileSize(note.fileSize)}</span>
                <span>{note.downloadCount} downloads</span>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleView(note)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDownload(note)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => extractQuestions(note)}
                className="w-full"
                disabled={extractingQuestions[note.id]}
              >
                {extractingQuestions[note.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Notes Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedSubject !== 'all' || selectedBranch !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Study notes will be available soon.'}
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedSubject('all')
                setSelectedBranch('all')
              }}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Display Modal */}
      {showQuestions && (
        <QuestionDisplay
          questions={extractedQuestions}
          summary={questionsSummary}
          onClose={() => setShowQuestions(false)}
        />
      )}
    </div>
  )
}

export default Notes