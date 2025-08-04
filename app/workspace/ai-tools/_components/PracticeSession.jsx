"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  RotateCcw, 
  X,
  TrendingUp,
  Target
} from 'lucide-react'
import QuestionRenderer from './QuestionRenderer'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

function PracticeSession({ settings, onComplete, onExit }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0
  })
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(uuidv4())
  const { user } = useUser()

  useEffect(() => {
    generateNextQuestion()
  }, [])

  const generateNextQuestion = async () => {
    try {
      setLoading(true)
      setShowFeedback(false)
      setCurrentAnswer('')

      const response = await axios.post('/api/generate-quiz-questions', {
        topic: settings.topic,
        questionCount: 1,
        difficulty: settings.difficulty,
        questionTypes: ['multiple_choice', 'true_false', 'short_answer']
      })

      if (response.data.success && response.data.questions.length > 0) {
        setCurrentQuestion(response.data.questions[0])
      } else {
        throw new Error('Failed to generate question')
      }
    } catch (error) {
      console.error('Failed to generate question:', error)
      toast.error('Failed to generate question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkAnswer = () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      toast.error('Please provide an answer')
      return
    }

    let correct = false

    switch (currentQuestion.type) {
      case 'multiple_choice':
      case 'true_false':
        correct = currentAnswer === currentQuestion.correctAnswer
        break
      case 'short_answer':
      case 'fill_blank':
        const userText = currentAnswer.toLowerCase().trim()
        const correctText = currentQuestion.correctAnswer.toLowerCase().trim()
        correct = userText === correctText
        break
      default:
        correct = false
    }

    setIsCorrect(correct)
    setShowFeedback(true)

    // Update session stats
    setSessionStats(prev => {
      const newStats = {
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
        currentStreak: correct ? prev.currentStreak + 1 : 0,
        bestStreak: correct ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak
      }

      // Save to backend if this is a milestone (every 5 questions)
      if (newStats.questionsAnswered % 5 === 0) {
        savePracticeProgress(newStats)
      }

      return newStats
    })
  }

  const savePracticeProgress = async (stats) => {
    try {
      await axios.post('/api/practice-sessions', {
        sessionId,
        topic: settings.topic,
        questionsAnswered: stats.questionsAnswered,
        correctAnswers: stats.correctAnswers,
        sessionData: {
          difficulty: settings.difficulty,
          currentStreak: stats.currentStreak,
          bestStreak: stats.bestStreak
        }
      })
    } catch (error) {
      console.error('Failed to save practice progress:', error)
    }
  }

  const nextQuestion = () => {
    if (sessionStats.questionsAnswered >= settings.questionCount) {
      completePractice()
    } else {
      generateNextQuestion()
    }
  }

  const completePractice = async () => {
    // Save final progress
    await savePracticeProgress(sessionStats)
    
    onComplete({
      totalQuestions: sessionStats.questionsAnswered,
      correctAnswers: sessionStats.correctAnswers,
      accuracy: sessionStats.questionsAnswered > 0 ? 
        Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100) : 0,
      bestStreak: sessionStats.bestStreak
    })
  }

  const handleAnswerChange = (answer) => {
    setCurrentAnswer(answer)
  }

  const progress = (sessionStats.questionsAnswered / settings.questionCount) * 100
  const accuracy = sessionStats.questionsAnswered > 0 ? 
    Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100) : 0

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Generating your first question...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Practice: {settings.topic}</h1>
              <p className="text-sm text-gray-600">
                Question {sessionStats.questionsAnswered + 1} of {settings.questionCount}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>{accuracy}% accuracy</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={onExit}>
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{sessionStats.questionsAnswered} of {settings.questionCount} completed</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{sessionStats.correctAnswers}</div>
                  <div className="text-xs text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{sessionStats.currentStreak}</div>
                  <div className="text-xs text-gray-600">Current Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{sessionStats.bestStreak}</div>
                  <div className="text-xs text-gray-600">Best Streak</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Practice Question</span>
                <Badge className="capitalize">{currentQuestion.difficulty}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionRenderer
                question={currentQuestion}
                answer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                disabled={showFeedback}
              />

              {/* Feedback */}
              {showFeedback && (
                <div className={`p-4 rounded-lg border ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div className="mb-3">
                      <span className="font-medium text-gray-700">Correct answer: </span>
                      <span className="text-green-600 font-medium">
                        {currentQuestion.correctAnswer}
                      </span>
                    </div>
                  )}

                  {currentQuestion.explanation && (
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-blue-800">Explanation: </span>
                        <span className="text-blue-700">{currentQuestion.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <div>
                  {showFeedback && (
                    <Button variant="outline" onClick={generateNextQuestion}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Another Question
                    </Button>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!showFeedback ? (
                    <Button 
                      onClick={checkAnswer}
                      disabled={!currentAnswer.trim() || loading}
                    >
                      Check Answer
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      {sessionStats.questionsAnswered >= settings.questionCount ? (
                        'Complete Practice'
                      ) : (
                        <>
                          Next Question
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Encouragement */}
        {sessionStats.currentStreak >= 3 && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Great streak!</h3>
                <p className="text-green-700">You've got {sessionStats.currentStreak} correct answers in a row!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PracticeSession