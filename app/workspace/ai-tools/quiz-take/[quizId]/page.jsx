"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { Badge } from '../../../../../components/ui/badge'
import QuizTaker from '../../_components/QuizTaker'
import TimerComponent from '../../_components/TimerComponent'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

function QuizTakePage() {
  const { quizId } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizSession, setQuizSession] = useState(null)

  useEffect(() => {
    if (quizId && user) {
      fetchQuiz()
    }
  }, [quizId, user])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/quizzes/${quizId}`)
      if (response.data.success) {
        setQuiz(response.data.quiz)
      } else {
        toast.error('Quiz not found')
        router.push('/workspace/ai-tools/my-quizzes')
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
      toast.error('Failed to load quiz')
      router.push('/workspace/ai-tools/my-quizzes')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    const session = {
      quizId: quiz.quizId,
      userId: user.primaryEmailAddress?.emailAddress,
      startTime: new Date(),
      currentQuestion: 0,
      answers: [],
      timeRemaining: (quiz.settings?.timeLimit || 30) * 60, // Convert to seconds
      isCompleted: false
    }
    setQuizSession(session)
    setQuizStarted(true)
  }

  const handleQuizComplete = (results) => {
    setQuizStarted(false)
    setQuizSession(null)
    // Navigate to results page
    router.push(`/workspace/ai-tools/quiz-results/${results.attemptId}`)
  }

  const handleTimeUp = () => {
    toast.warning('Time is up! Quiz will be submitted automatically.')
    // Auto-submit quiz when time runs out
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Quiz not found</h2>
          <Link href="/workspace/ai-tools/my-quizzes">
            <Button>Back to My Quizzes</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (quizStarted && quizSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Quiz Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">{quiz.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {quizSession.currentQuestion + 1} of {quiz.questions?.length}
                </p>
              </div>
              <TimerComponent
                initialTime={quizSession.timeRemaining}
                onTimeUp={handleTimeUp}
              />
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <QuizTaker
            quiz={quiz}
            session={quizSession}
            onComplete={handleQuizComplete}
            onSessionUpdate={setQuizSession}
          />
        </div>
      </div>
    )
  }

  // Quiz Start Screen
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/workspace/ai-tools/my-quizzes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Quizzes
          </Button>
        </Link>
      </div>

      {/* Quiz Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          {quiz.description && (
            <p className="text-gray-600">{quiz.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {quiz.questions?.length || 0}
              </div>
              <div className="text-sm text-blue-800">Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quiz.settings?.timeLimit || 30}
              </div>
              <div className="text-sm text-green-800">Minutes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {quiz.settings?.passingScore || 70}%
              </div>
              <div className="text-sm text-purple-800">To Pass</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0}
              </div>
              <div className="text-sm text-orange-800">Total Points</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(quiz.settings?.difficulty)}>
              {quiz.settings?.difficulty || 'intermediate'}
            </Badge>
            <Badge variant="outline">{quiz.topic}</Badge>
            {quiz.settings?.questionTypes?.map((type) => (
              <Badge key={type} variant="outline">
                {type.replace('_', ' ')}
              </Badge>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Instructions
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• You have {quiz.settings?.timeLimit || 30} minutes to complete this quiz</li>
              <li>• You need {quiz.settings?.passingScore || 70}% to pass</li>
              <li>• Questions will be presented one at a time</li>
              <li>• You can navigate between questions before submitting</li>
              {quiz.settings?.allowRetake && <li>• You can retake this quiz if needed</li>}
              <li>• Make sure you have a stable internet connection</li>
            </ul>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button onClick={startQuiz} size="lg" className="px-8">
              <Clock className="h-5 w-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizTakePage