"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, RefreshCw, Share2, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { Badge } from '../../../../../components/ui/badge'
import { Progress } from '../../../../../components/ui/progress'
import ResultsDisplay from '../../_components/ResultsDisplay'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

function QuizResultsPage() {
  const { attemptId } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [attempt, setAttempt] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (attemptId && user) {
      fetchResults()
    }
  }, [attemptId, user])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/quiz-attempts/${attemptId}`)
      if (response.data.success) {
        setAttempt(response.data.attempt)
        setQuiz(response.data.quiz)
      } else {
        toast.error('Results not found')
        router.push('/workspace/ai-tools/my-quizzes')
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
      toast.error('Failed to load results')
      router.push('/workspace/ai-tools/my-quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleRetakeQuiz = () => {
    router.push(`/workspace/ai-tools/quiz-take/${quiz.quizId}`)
  }

  const handleShareResults = async () => {
    try {
      const shareData = {
        title: `Quiz Results: ${quiz.title}`,
        text: `I scored ${attempt.score}/${attempt.maxScore} (${Math.round((attempt.score / attempt.maxScore) * 100)}%) on "${quiz.title}"`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
        toast.success('Results copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share results:', error)
      toast.error('Failed to share results')
    }
  }

  const downloadResults = () => {
    const resultsData = {
      quiz: quiz.title,
      score: `${attempt.score}/${attempt.maxScore}`,
      percentage: `${Math.round((attempt.score / attempt.maxScore) * 100)}%`,
      timeTaken: formatTime(attempt.timeTaken),
      completedAt: new Date(attempt.endTime).toLocaleString(),
      passed: (attempt.score / attempt.maxScore) * 100 >= (quiz.settings?.passingScore || 70)
    }

    const dataStr = JSON.stringify(resultsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quiz-results-${quiz.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getResultIcon = () => {
    const percentage = (attempt.score / attempt.maxScore) * 100
    const passingScore = quiz.settings?.passingScore || 70

    if (percentage >= passingScore) {
      return <Trophy className="h-8 w-8 text-yellow-500" />
    } else if (percentage >= passingScore * 0.8) {
      return <CheckCircle className="h-8 w-8 text-blue-500" />
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getResultMessage = () => {
    const percentage = (attempt.score / attempt.maxScore) * 100
    const passingScore = quiz.settings?.passingScore || 70

    if (percentage >= passingScore) {
      return {
        title: "Congratulations! 🎉",
        message: "You passed the quiz!",
        color: "text-green-600"
      }
    } else if (percentage >= passingScore * 0.8) {
      return {
        title: "Good effort! 👍",
        message: "You're close to passing. Try again!",
        color: "text-blue-600"
      }
    } else {
      return {
        title: "Keep practicing! 📚",
        message: "Review the material and try again.",
        color: "text-red-600"
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!attempt || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Results not found</h2>
          <Link href="/workspace/ai-tools/my-quizzes">
            <Button>Back to My Quizzes</Button>
          </Link>
        </div>
      </div>
    )
  }

  const percentage = Math.round((attempt.score / attempt.maxScore) * 100)
  const passed = percentage >= (quiz.settings?.passingScore || 70)
  const resultMessage = getResultMessage()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Link href="/workspace">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-bold">Quiz Results</h1>
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleShareResults} className="w-full sm:w-auto">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={downloadResults} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <Card className="text-center">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex justify-center mb-4">
            {getResultIcon()}
          </div>
          <CardTitle className="text-xl sm:text-2xl px-2">{quiz.title}</CardTitle>
          <div className={`text-lg sm:text-xl font-semibold ${resultMessage.color}`}>
            {resultMessage.title}
          </div>
          <p className="text-gray-600 text-sm sm:text-base">{resultMessage.message}</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-bold text-primary mb-2">
              {percentage}%
            </div>
            <div className="text-base sm:text-lg text-gray-600">
              {attempt.score} out of {attempt.maxScore} points
            </div>
            <Progress value={percentage} className="w-full max-w-md mx-auto mt-4" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {Math.round((attempt.score / attempt.maxScore) * 100)}%
              </div>
              <div className="text-xs sm:text-sm text-blue-800">Score</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {formatTime(attempt.timeTaken)}
              </div>
              <div className="text-xs sm:text-sm text-green-800">Time Taken</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">
                {quiz.settings?.passingScore || 70}%
              </div>
              <div className="text-xs sm:text-sm text-purple-800">Passing Score</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">
                {passed ? 'PASS' : 'FAIL'}
              </div>
              <div className="text-xs sm:text-sm text-orange-800">Result</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            {quiz.settings?.allowRetake !== false && (
              <Button onClick={handleRetakeQuiz} size="lg" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            <Link href={`/workspace/ai-tools/analytics?quiz=${quiz.quizId}`} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <ResultsDisplay
        attempt={attempt}
        quiz={quiz}
        showCorrectAnswers={quiz.settings?.showResultsImmediately !== false}
      />

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Quiz Details</h4>
              <div className="space-y-1 text-sm">
                <div>Topic: {quiz.topic}</div>
                <div>Difficulty: <Badge className="ml-1">{quiz.settings?.difficulty}</Badge></div>
                <div>Questions: {quiz.questions?.length}</div>
                <div>Time Limit: {quiz.settings?.timeLimit} minutes</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Attempt Details</h4>
              <div className="space-y-1 text-sm">
                <div>Started: {new Date(attempt.startTime).toLocaleString()}</div>
                <div>Completed: {new Date(attempt.endTime).toLocaleString()}</div>
                <div>Duration: {formatTime(attempt.timeTaken)}</div>
                <div>Attempt ID: {attempt.attemptId}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizResultsPage