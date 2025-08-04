"use client"
import React, { useState, useEffect } from 'react'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import { BookOpen, Lightbulb } from 'lucide-react'
import axios from 'axios'

function TopicSelector({ value, onChange }) {
  const [courses, setCourses] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses')
      setCourses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const topicSuggestions = [
    'JavaScript Fundamentals',
    'React Components',
    'Database Design',
    'Machine Learning Basics',
    'Web Security',
    'Data Structures',
    'API Development',
    'UI/UX Design Principles',
    'Cloud Computing',
    'Agile Methodology'
  ]

  const handleTopicSelect = (topic) => {
    onChange(topic)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Topic *</label>
      
      <div className="relative">
        <Input
          placeholder="Enter topic or select from suggestions"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
        
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Course Topics */}
            {courses.length > 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">From Your Courses</span>
                </div>
                <div className="space-y-1">
                  {courses.slice(0, 5).map((course, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleTopicSelect(course.courseJson?.course?.name || course.name)}
                    >
                      <div>
                        <div className="font-medium">{course.courseJson?.course?.name || course.name}</div>
                        <div className="text-xs text-gray-500">{course.courseJson?.course?.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Suggestions */}
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Popular Topics</span>
              </div>
              <div className="space-y-1">
                {topicSuggestions.map((topic, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleTopicSelect(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}

export default TopicSelector