"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Progress } from './progress'
import { Badge } from './badge'
import { BookOpen, FileText, Target, Code, TrendingUp } from 'lucide-react'
import axios from 'axios'

export function ProgressTracker({ branchCode, subjectCode, className }) {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    if (branchCode) {
      fetchProgress()
    }
  }, [branchCode, subjectCode])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ branchCode })
      if (subjectCode) params.append('subjectCode', subjectCode)
      
      const response = await axios.get(`/api/branch-progress?${params}`)
      const progressData = response.data.progress || []
      setProgress(progressData)
      
      // Calculate overall progress
      if (progressData.length > 0) {
        const avgProgress = progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / progressData.length
        setOverallProgress(Math.round(avgProgress))
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (activityType, progressData, completionPercentage) => {
    try {
      await axios.post('/api/branch-progress', {
        branchCode,
        subjectCode: subjectCode || 'general',
        activityType,
        progressData,
        completionPercentage
      })
      
      // Refresh progress data
      fetchProgress()
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'quiz': return <FileText className="h-4 w-4" />
      case 'practice': return <Target className="h-4 w-4" />
      case 'reading': return <BookOpen className="h-4 w-4" />
      case 'coding': return <Code className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'quiz': return 'text-blue-500'
      case 'practice': return 'text-green-500'
      case 'reading': return 'text-purple-500'
      case 'coding': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Progress Tracking</span>
          <Badge variant="outline">{overallProgress}% Complete</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Activity-wise Progress */}
        <div className="space-y-3">
          {progress.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No progress data yet</p>
              <p className="text-xs">Start learning to track your progress</p>
            </div>
          ) : (
            progress.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`${getActivityColor(item.activityType)}`}>
                  {getActivityIcon(item.activityType)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{item.activityType}</span>
                    <span>{item.completionPercentage}%</span>
                  </div>
                  <Progress value={item.completionPercentage} className="h-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Summary */}
        {progress.length > 0 && (
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{progress.length}</div>
                <div className="text-gray-600">Activities</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {progress.filter(p => p.completionPercentage >= 80).length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for updating progress from other components
export const useProgressTracker = () => {
  const updateProgress = async (branchCode, subjectCode, activityType, progressData, completionPercentage) => {
    try {
      await axios.post('/api/branch-progress', {
        branchCode,
        subjectCode,
        activityType,
        progressData,
        completionPercentage
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  return { updateProgress }
}