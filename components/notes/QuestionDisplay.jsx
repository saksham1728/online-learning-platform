"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Download, 
  Copy, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Target, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

function QuestionDisplay({ questions, summary, onClose }) {
  const [showAnswers, setShowAnswers] = useState({})
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')

  const toggleAnswer = (questionId) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const copyQuestion = async (question) => {
    try {
      const text = `Q: ${question.question}\nA: ${question.answer}\nDifficulty: ${question.difficulty}\nTopic: ${question.topic}`
      await navigator.clipboard.writeText(text)
      toast.success('Question copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy question')
    }
  }

  const exportQuestions = () => {
    try {
      const filteredQuestions = getFilteredQuestions()
      const content = filteredQuestions.map((q, index) => 
        `${index + 1}. ${q.question}\n   Answer: ${q.answer}\n   Difficulty: ${q.difficulty} | Topic: ${q.topic} | Marks: ${q.marks}\n`
      ).join('\n')
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extracted_questions_${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Questions exported successfully!')
    } catch (error) {
      toast.error('Failed to export questions')
    }
  }

  const getFilteredQuestions = () => {
    return questions.filter(q => {
      const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
      const topicMatch = selectedTopic === 'all' || q.topic === selectedTopic
      return difficultyMatch && topicMatch
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'MCQ': return <Target className="h-4 w-4" />
      case 'Short Answer': return <FileText className="h-4 w-4" />
      case 'Long Answer': return <BookOpen className="h-4 w-4" />
      case 'Numerical': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredQuestions = getFilteredQuestions()
  const uniqueTopics = [...new Set(questions.map(q => q.topic))]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Extracted Questions</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.topicsCovered?.length || 0}</div>
              <div className="text-sm text-gray-600">Topics Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(summary.difficultyDistribution || {}).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-gray-600">Questions Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(summary.difficultyDistribution || {}).map(([difficulty, count]) => (
              <Badge key={difficulty} variant="outline" className={getDifficultyColor(difficulty)}>
                {difficulty}: {count}
              </Badge>
            ))}
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select 
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Topics</option>
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>

            <Button size="sm" onClick={exportQuestions} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export ({filteredQuestions.length})
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-700">Q{index + 1}.</span>
                        <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getQuestionTypeIcon(question.questionType)}
                          {question.questionType}
                        </Badge>
                        <Badge variant="outline">
                          {question.marks} marks
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-relaxed">
                        {question.question}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>Topic: {question.topic}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyQuestion(question)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAnswer(question.id)}
                      >
                        {showAnswers[question.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {showAnswers[question.id] && (
                  <CardContent className="pt-0">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">Answer:</span>
                      </div>
                      <p className="text-green-700 leading-relaxed">{question.answer}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Questions Found</h3>
              <p className="text-gray-500">
                Try adjusting your filters to see more questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionDisplay