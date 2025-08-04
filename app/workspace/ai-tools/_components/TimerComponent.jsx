"use client"
import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '../../../../components/ui/badge'

function TimerComponent({ initialTime, onTimeUp }) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        
        // Set warning states
        const warningThreshold = Math.max(300, initialTime * 0.2) // 5 minutes or 20% of total time
        const criticalThreshold = Math.max(60, initialTime * 0.05) // 1 minute or 5% of total time
        
        setIsWarning(newTime <= warningThreshold && newTime > criticalThreshold)
        setIsCritical(newTime <= criticalThreshold)
        
        if (newTime <= 0) {
          onTimeUp()
          return 0
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, initialTime, onTimeUp])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (isCritical) return 'bg-red-100 text-red-800 border-red-200'
    if (isWarning) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getTimerIcon = () => {
    if (isCritical || isWarning) return <AlertTriangle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <Badge className={`${getTimerColor()} border px-3 py-1 text-sm font-mono`}>
      <div className="flex items-center space-x-2">
        {getTimerIcon()}
        <span>{formatTime(timeRemaining)}</span>
      </div>
    </Badge>
  )
}

export default TimerComponent