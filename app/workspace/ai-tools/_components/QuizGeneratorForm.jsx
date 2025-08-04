"use client"
import React, { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Loader2Icon, Sparkles, Settings } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import TopicSelector from './TopicSelector'
import QuizSettings from './QuizSettings'

function QuizGeneratorForm({ onQuestionsGenerated, onGenerationStart, onGenerationEnd, isGenerating }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    questionCount: 10,
    difficulty: 'intermediate',
    questionTypes: ['multiple_choice', 'true_false'],
    timeLimit: 30, // minutes
    passingScore: 70
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuestionTypesChange = (types) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: types
    }))
  }

  const generateQuestions = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for the quiz')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title for the quiz')
      return
    }

    try {
      onGenerationStart()
      
      const response = await axios.post('/api/generate-quiz-questions', {
        topic: formData.topic,
        questionCount: formData.questionCount,
        difficulty: formData.difficulty,
        questionTypes: formData.questionTypes
      })

      if (response.data.success) {
        onQuestionsGenerated(response.data.questions, formData)
        toast.success(`Generated ${response.data.questions.length} questions successfully!`)
        
        if (response.data.metadata.fallback) {
          toast.warning('Using fallback questions due to AI service issues')
        }
      } else {
        throw new Error('Failed to generate questions')
      }
    } catch (error) {
      console.error('Quiz generation error:', error)
      toast.error('Failed to generate questions. Please try again.')
    } finally {
      onGenerationEnd()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Generate Quiz</h2>
      </div>

      {/* Basic Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title *</label>
          <Input
            placeholder="Enter quiz title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description (Optional)</label>
          <Textarea
            placeholder="Brief description of the quiz"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <TopicSelector
          value={formData.topic}
          onChange={(topic) => handleInputChange('topic', topic)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Number of Questions</label>
            <Select value={formData.questionCount.toString()} onValueChange={(value) => handleInputChange('questionCount', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
                <SelectItem value="25">25 Questions</SelectItem>
                <SelectItem value="30">30 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
            <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
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
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </Button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <QuizSettings
          settings={formData}
          onSettingsChange={handleInputChange}
          onQuestionTypesChange={handleQuestionTypesChange}
        />
      )}

      {/* Generate Button */}
      <Button
        onClick={generateQuestions}
        disabled={isGenerating || !formData.topic.trim() || !formData.title.trim()}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="h-5 w-5 mr-2 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Quiz
          </>
        )}
      </Button>
    </div>
  )
}

export default QuizGeneratorForm