"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import QuizCard from '../_components/QuizCard'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchQuizzes()
    }
  }, [user])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/quizzes')
      setQuizzes(response.data.quizzes || [])
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      await axios.delete(`/api/quizzes/${quizId}`)
      setQuizzes(quizzes.filter(quiz => quiz.quizId !== quizId))
      toast.success('Quiz deleted successfully')
    } catch (error) {
      console.error('Failed to delete quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  const handleDuplicateQuiz = async (quiz) => {
    try {
      const duplicatedQuiz = {
        ...quiz,
        quizId: `${quiz.quizId}_copy_${Date.now()}`,
        title: `${quiz.title} (Copy)`,
        createdAt: new Date().toISOString()
      }
      
      const response = await axios.post('/api/quizzes', duplicatedQuiz)
      if (response.data.success) {
        fetchQuizzes()
        toast.success('Quiz duplicated successfully')
      }
    } catch (error) {
      console.error('Failed to duplicate quiz:', error)
      toast.error('Failed to duplicate quiz')
    }
  }

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.topic.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDifficulty = filterDifficulty === 'all' || quiz.settings?.difficulty === filterDifficulty
      return matchesSearch && matchesDifficulty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
          return difficultyOrder[a.settings?.difficulty] - difficultyOrder[b.settings?.difficulty]
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/ai-tools">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AI Tools
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">My Quizzes</h1>
            <p className="text-gray-600">Manage your created quizzes</p>
          </div>
        </div>
        <Link href="/workspace/ai-tools/quiz-generator">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-500 flex items-center">
            {filteredQuizzes.length} of {quizzes.length} quizzes
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.quizId}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
              onDuplicate={handleDuplicateQuiz}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || filterDifficulty !== 'all' ? 'No quizzes found' : 'No quizzes yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterDifficulty !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first quiz to get started'
            }
          </p>
          <Link href="/workspace/ai-tools/quiz-generator">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyQuizzes