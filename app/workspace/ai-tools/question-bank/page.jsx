"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, Plus, Search, Filter, Edit, Trash2, Download, Eye, Sparkles, Brain, Target, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog'
import { Label } from '../../../../components/ui/label'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function QuestionBank() {
  const [questionBanks, setQuestionBanks] = useState([])
  const [filteredBanks, setFilteredBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    category: 'general',
    difficulty: 'medium',
    questionCount: 10,
    questionTypes: ['multiple-choice']
  })
  const { user } = useUser()

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business' },
    { value: 'history', label: 'History' },
    { value: 'literature', label: 'Literature' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ]

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ]

  useEffect(() => {
    if (user) {
      loadQuestionBanks()
    }
  }, [user])

  useEffect(() => {
    filterBanks()
  }, [questionBanks, searchTerm, selectedCategory, selectedDifficulty])

  const loadQuestionBanks = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/question-banks')
      if (response.data.success) {
        setQuestionBanks(response.data.questionBanks || [])
      }
    } catch (error) {
      console.error('Failed to load question banks:', error)
      // For now, show empty state
      setQuestionBanks([])
    } finally {
      setLoading(false)
    }
  }

  const filterBanks = () => {
    let filtered = questionBanks

    if (searchTerm) {
      filtered = filtered.filter(bank => 
        bank.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bank => bank.category === selectedCategory)
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(bank => bank.difficulty === selectedDifficulty)
    }

    setFilteredBanks(filtered)
  }

  const handleCreateQuestionBank = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for the question bank')
      return
    }

    try {
      setGenerating(true)
      toast.info('Generating questions using AI...')

      const response = await axios.post('/api/question-banks/generate', {
        topic: formData.topic.trim(),
        description: formData.description.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        questionCount: formData.questionCount,
        questionTypes: formData.questionTypes
      })

      if (response.data.success) {
        toast.success(`Successfully generated ${response.data.questionBank.questions.length} questions!`)
        setShowCreateModal(false)
        setFormData({
          topic: '',
          description: '',
          category: 'general',
          difficulty: 'medium',
          questionCount: 10,
          questionTypes: ['multiple-choice']
        })
        loadQuestionBanks()
      } else {
        toast.error('Failed to generate question bank')
      }
    } catch (error) {
      console.error('Failed to generate question bank:', error)
      toast.error('Failed to generate question bank')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteBank = async (bankId, topic) => {
    if (!confirm(`Are you sure you want to delete the question bank "${topic}"? This action cannot be undone.`)) {
      return
    }

    try {
      await axios.delete(`/api/question-banks/${bankId}`)
      toast.success('Question bank deleted successfully')
      loadQuestionBanks()
    } catch (error) {
      console.error('Failed to delete question bank:', error)
      toast.error('Failed to delete question bank')
    }
  }

  const handleViewBank = (bank) => {
    // Navigate to detailed view (to be implemented)
    toast.info(`Viewing ${bank.topic} question bank...`)
  }

  const handleDownloadBank = (bank) => {
    // Download functionality (to be implemented)
    toast.info(`Downloading ${bank.topic} question bank...`)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'computer-science': return '💻'
      case 'mathematics': return '🔢'
      case 'physics': return '⚛️'
      case 'chemistry': return '🧪'
      case 'biology': return '🧬'
      case 'engineering': return '⚙️'
      case 'business': return '💼'
      case 'history': return '📚'
      case 'literature': return '📖'
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading question banks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <Link href="/workspace/ai-tools">
            <Button variant="outline" size="sm" className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AI Tools
            </Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Question Bank
          </Button>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Question Bank</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Generate and manage custom question collections using AI
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
                placeholder="Search question banks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {getCategoryIcon(category.value)} {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Banks Grid */}
      {filteredBanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBanks.map((bank) => (
            <Card key={bank.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(bank.category)}</span>
                      <CardTitle className="text-lg">{bank.topic}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{bank.category}</Badge>
                      <Badge className={getDifficultyColor(bank.difficulty)}>
                        {bank.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <BookOpen className="h-8 w-8 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {bank.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {bank.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{bank.questions?.length || 0} questions</span>
                  <span>Created {new Date(bank.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewBank(bank)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadBank(bank)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleDeleteBank(bank.id, bank.topic)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Question Banks Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first AI-generated question bank to get started.'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Question Bank
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Question Bank Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Create AI Question Bank</span>
            </DialogTitle>
            <DialogDescription>
              Generate a custom question bank using AI for any topic or subject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., JavaScript Fundamentals, Calculus, World War II..."
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide additional context or specific areas to focus on..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {getCategoryIcon(category.value)} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Select 
                value={formData.questionCount.toString()} 
                onValueChange={(value) => setFormData({...formData, questionCount: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                  <SelectItem value="25">25 Questions</SelectItem>
                  <SelectItem value="30">30 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">AI Generation Preview</span>
              </div>
              <p className="text-sm text-blue-700">
                AI will generate {formData.questionCount} {formData.difficulty} level questions about "{formData.topic || 'your topic'}" 
                in the {categories.find(c => c.value === formData.category)?.label} category.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateQuestionBank} 
              disabled={generating || !formData.topic.trim()}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuestionBank