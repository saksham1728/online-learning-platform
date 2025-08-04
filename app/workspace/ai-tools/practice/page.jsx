"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Play, Target, TrendingUp, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import PracticeSession from '../_components/PracticeSession'
import TopicSelector from '../_components/TopicSelector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

function PracticePage() {
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [practiceSettings, setPracticeSettings] = useState({
    topic: '',
    difficulty: 'intermediate',
    questionCount: 10
  })
  const [practiceStats, setPracticeStats] = useState({
    totalSessions: 0,
    totalQuestions: 0,
    averageScore: 0,
    recentSessions: []
  })
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchPracticeStats()
    }
  }, [user])

  const fetchPracticeStats = async () => {
    try {
      const response = await axios.get('/api/practice-sessions')
      if (response.data.success) {
        setPracticeStats(response.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch practice stats:', error)
    }
  }

  const handleSettingChange = (field, value) => {
    setPracticeSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startPractice = () => {
    if (!practiceSettings.topic.trim()) {
      toast.error('Please select a topic to practice')
      return
    }
    setPracticeStarted(true)
  }

  const handlePracticeComplete = (results) => {
    setPracticeStarted(false)
    fetchPracticeStats() // Refresh stats
    toast.success(`Practice completed! You scored ${results.correctAnswers}/${results.totalQuestions}`)
  }

  if (practiceStarted) {
    return (
      <PracticeSession
        settings={practiceSettings}
        onComplete={handlePracticeComplete}
        onExit={() => setPracticeStarted(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/workspace/ai-tools">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Tools
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Practice Mode</h1>
          <p className="text-gray-600">Practice with unlimited AI-generated questions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Setup */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <span>Start Practice Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Selection */}
              <div>
                <TopicSelector
                  value={practiceSettings.topic}
                  onChange={(topic) => handleSettingChange('topic', topic)}
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                  <Select 
                    value={practiceSettings.difficulty} 
                    onValueChange={(value) => handleSettingChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Questions per Session</label>
                  <Select 
                    value={practiceSettings.questionCount.toString()} 
                    onValueChange={(value) => handleSettingChange('questionCount', parseInt(value))}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Practice Features */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Practice Features:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Unlimited questions on your chosen topic</li>
                  <li>• Immediate feedback and explanations</li>
                  <li>• No time pressure - learn at your own pace</li>
                  <li>• Progress tracking and performance insights</li>
                  <li>• Adaptive difficulty based on your performance</li>
                </ul>
              </div>

              {/* Start Button */}
              <Button 
                onClick={startPractice} 
                size="lg" 
                className="w-full"
                disabled={!practiceSettings.topic.trim()}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Practice Session
              </Button>
            </CardContent>
          </Card>

          {/* Recent Practice Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-green-500" />
                <span>Recent Practice Topics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {practiceStats.recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {practiceStats.recentSessions.slice(0, 5).map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{session.topic}</div>
                        <div className="text-sm text-gray-600">
                          {session.correctAnswers}/{session.questionsAnswered} correct
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {Math.round((session.correctAnswers / session.questionsAnswered) * 100)}%
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No practice sessions yet</p>
                  <p className="text-sm">Start your first practice session to see your progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Practice Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
                <span>Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {practiceStats.totalSessions}
                </div>
                <div className="text-sm text-purple-800">Practice Sessions</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {practiceStats.totalQuestions}
                </div>
                <div className="text-sm text-blue-800">Questions Answered</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {practiceStats.averageScore}%
                </div>
                <div className="text-sm text-green-800">Average Score</div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Focus on topics where you scored below 70%</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Read explanations carefully to understand concepts</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Practice regularly for better retention</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Try different difficulty levels to challenge yourself</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PracticePage