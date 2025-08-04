"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Target, Clock, Award, BarChart3, PieChart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import PersonalDashboard from '../_components/PersonalDashboard'
import QuizHistory from '../_components/QuizHistory'
import ProgressTracking from '../_components/ProgressTracking'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      totalPracticeSessions: 0,
      totalPracticeQuestions: 0,
      practiceAccuracy: 0
    },
    recentAttempts: [],
    topicPerformance: [],
    difficultyBreakdown: [],
    practiceStats: []
  })
  const [timeRange, setTimeRange] = useState('all')
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch quiz attempts
      const attemptsResponse = await axios.get('/api/quiz-attempts')
      const attempts = attemptsResponse.data.attempts || []

      // Fetch practice sessions
      const practiceResponse = await axios.get('/api/practice-sessions')
      const practiceStats = practiceResponse.data.stats || {}

      // Fetch user's quizzes
      const quizzesResponse = await axios.get('/api/quizzes')
      const quizzes = quizzesResponse.data.quizzes || []

      // Process analytics data
      const processedData = processAnalyticsData(attempts, practiceStats, quizzes)
      setAnalyticsData(processedData)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (attempts, practiceStats, quizzes) => {
    // Filter attempts by time range
    const filteredAttempts = filterByTimeRange(attempts, timeRange)

    // Calculate overview stats
    const totalAttempts = filteredAttempts.length
    const totalScore = filteredAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
    const totalMaxScore = filteredAttempts.reduce((sum, attempt) => sum + attempt.maxScore, 0)
    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

    // Topic performance analysis
    const topicStats = {}
    filteredAttempts.forEach(attempt => {
      // We'd need to get quiz data to determine topic, for now use a placeholder
      const topic = 'General' // This would come from the quiz data
      if (!topicStats[topic]) {
        topicStats[topic] = { attempts: 0, totalScore: 0, totalMaxScore: 0 }
      }
      topicStats[topic].attempts++
      topicStats[topic].totalScore += attempt.score
      topicStats[topic].totalMaxScore += attempt.maxScore
    })

    const topicPerformance = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      attempts: stats.attempts,
      averageScore: stats.totalMaxScore > 0 ? Math.round((stats.totalScore / stats.totalMaxScore) * 100) : 0
    }))

    // Difficulty breakdown (placeholder - would need quiz data)
    const difficultyBreakdown = [
      { difficulty: 'Beginner', attempts: Math.floor(totalAttempts * 0.3), averageScore: 85 },
      { difficulty: 'Intermediate', attempts: Math.floor(totalAttempts * 0.5), averageScore: 72 },
      { difficulty: 'Advanced', attempts: Math.floor(totalAttempts * 0.2), averageScore: 58 }
    ]

    return {
      overview: {
        totalQuizzes: quizzes.length,
        totalAttempts,
        averageScore,
        totalPracticeSessions: practiceStats.totalSessions || 0,
        totalPracticeQuestions: practiceStats.totalQuestions || 0,
        practiceAccuracy: practiceStats.averageScore || 0
      },
      recentAttempts: filteredAttempts.slice(0, 10),
      topicPerformance,
      difficultyBreakdown,
      practiceStats: practiceStats.recentSessions || []
    }
  }

  const filterByTimeRange = (data, range) => {
    if (range === 'all') return data

    const now = new Date()
    const cutoffDate = new Date()

    switch (range) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      default:
        return data
    }

    return data.filter(item => new Date(item.createdAt) >= cutoffDate)
  }

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (score >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (score >= 70) return { text: 'Average', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const performanceBadge = getPerformanceBadge(analyticsData.overview.averageScore)

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
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
            <p className="text-gray-600">Track your learning progress and identify areas for improvement</p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.totalQuizzes}</div>
                <div className="text-sm text-gray-600">Quizzes Created</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.totalAttempts}</div>
                <div className="text-sm text-gray-600">Quiz Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.overview.averageScore)}`}>
                  {analyticsData.overview.averageScore}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.totalPracticeSessions}</div>
                <div className="text-sm text-gray-600">Practice Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Overview</span>
            <Badge className={performanceBadge.color}>
              {performanceBadge.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiz Performance */}
            <div>
              <h3 className="font-semibold mb-3">Quiz Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Score</span>
                  <span className={`font-semibold ${getPerformanceColor(analyticsData.overview.averageScore)}`}>
                    {analyticsData.overview.averageScore}%
                  </span>
                </div>
                <Progress value={analyticsData.overview.averageScore} className="h-2" />
                <div className="text-xs text-gray-500">
                  Based on {analyticsData.overview.totalAttempts} quiz attempts
                </div>
              </div>
            </div>

            {/* Practice Performance */}
            <div>
              <h3 className="font-semibold mb-3">Practice Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Practice Accuracy</span>
                  <span className={`font-semibold ${getPerformanceColor(analyticsData.overview.practiceAccuracy)}`}>
                    {analyticsData.overview.practiceAccuracy}%
                  </span>
                </div>
                <Progress value={analyticsData.overview.practiceAccuracy} className="h-2" />
                <div className="text-xs text-gray-500">
                  Based on {analyticsData.overview.totalPracticeQuestions} practice questions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalDashboard data={analyticsData} />
        <ProgressTracking data={analyticsData} />
      </div>

      {/* Quiz History */}
      <QuizHistory attempts={analyticsData.recentAttempts} />

      {/* Topic Performance */}
      {analyticsData.topicPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-blue-500" />
              <span>Topic Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topicPerformance.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{topic.topic}</div>
                    <div className="text-sm text-gray-600">{topic.attempts} attempts</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPerformanceColor(topic.averageScore)}`}>
                      {topic.averageScore}%
                    </div>
                    <Progress value={topic.averageScore} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.overview.averageScore < 70 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">Focus on Practice</div>
                <div className="text-sm text-yellow-700">
                  Your average score is below 70%. Consider spending more time in practice mode to improve your understanding.
                </div>
              </div>
            )}
            
            {analyticsData.overview.totalPracticeSessions < 5 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800">Try Practice Mode</div>
                <div className="text-sm text-blue-700">
                  Practice mode offers unlimited questions with immediate feedback. It's a great way to reinforce your learning.
                </div>
              </div>
            )}

            {analyticsData.overview.totalAttempts === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">Take Your First Quiz</div>
                <div className="text-sm text-green-700">
                  Start by taking a quiz to establish your baseline performance and identify areas for improvement.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage