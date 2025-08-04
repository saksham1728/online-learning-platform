"use client"
import React, { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Eye, Save, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

function QuestionPreview({ questions, quizSettings, isGenerating }) {
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  const handleSaveQuiz = async () => {
    if (!questions.length || !quizSettings) {
      toast.error('No questions to save')
      return
    }

    if (!user) {
      toast.error('Please sign in to save quiz')
      return
    }

    try {
      setIsSaving(true)
      
      const quizData = {
        quizId: uuidv4(),
        title: quizSettings.title,
        description: quizSettings.description,
        topic: quizSettings.topic,
        courseId: null, // Can be linked to course later
        creatorEmail: user.primaryEmailAddress?.emailAddress,
        settings: {
          questionCount: questions.length,
          difficulty: quizSettings.difficulty,
          timeLimit: quizSettings.timeLimit,
          passingScore: quizSettings.passingScore,
          questionTypes: quizSettings.questionTypes,
          randomizeQuestions: quizSettings.randomizeQuestions || false,
          showResultsImmediately: quizSettings.showResultsImmediately !== false,
          allowRetake: quizSettings.allowRetake !== false
        },
        questions: questions,
        isPublished: true
      }

      const response = await axios.post('/api/quizzes', quizData)
      
      if (response.data.success) {
        toast.success('Quiz saved successfully!')
        router.push('/workspace/ai-tools/my-quizzes')
      } else {
        throw new Error('Failed to save quiz')
      }
    } catch (error) {
      console.error('Save quiz error:', error)
      toast.error('Failed to save quiz. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice':
        return '🔘'
      case 'true_false':
        return '✓/✗'
      case 'short_answer':
        return '📝'
      case 'fill_blank':
        return '___'
      default:
        return '❓'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Generating Questions...</h3>
          <p className="text-gray-600">AI is creating your quiz questions. This may take a moment.</p>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center space-y-4">
          <Eye className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600">Question Preview</h3>
          <p className="text-gray-500">Generated questions will appear here for review before saving.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[selectedQuestion]

  return (
    <div className="space-y-6">
      {/* Quiz Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quiz Preview</span>
            <Badge variant="outline">{questions.length} Questions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">{quizSettings?.title}</h3>
            <p className="text-sm text-gray-600">{quizSettings?.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(quizSettings?.difficulty)}>
                {quizSettings?.difficulty}
              </Badge>
              <Badge variant="outline">
                {quizSettings?.timeLimit} min
              </Badge>
              <Badge variant="outline">
                {quizSettings?.passingScore}% to pass
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Questions</h3>
          <span className="text-sm text-gray-500">
            {selectedQuestion + 1} of {questions.length}
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-4">
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={selectedQuestion === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedQuestion(index)}
              className="h-8"
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Question Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span>{getQuestionTypeIcon(currentQuestion.type)}</span>
              <span>Question {selectedQuestion + 1}</span>
            </span>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline">{currentQuestion.points} pts</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-medium">{currentQuestion.question}</div>
          
          {/* Answer Options */}
          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    option === currentQuestion.correctAnswer
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {option === currentQuestion.correctAnswer ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>{String.fromCharCode(65 + index)}. {option}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <div
                  key={option}
                  className={`p-3 rounded-lg border ${
                    option === currentQuestion.correctAnswer
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {option === currentQuestion.correctAnswer ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'fill_blank') && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Correct Answer:</span>
                <span>{currentQuestion.correctAnswer}</span>
              </div>
            </div>
          )}

          {/* Explanation */}
          {currentQuestion.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Question
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
        
        <Button onClick={handleSaveQuiz} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default QuestionPreview