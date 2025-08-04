"use client"
import React from 'react'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Clock, Target, CheckSquare } from 'lucide-react'

function QuizSettings({ settings, onSettingsChange, onQuestionTypesChange }) {
  const questionTypeOptions = [
    { id: 'multiple_choice', label: 'Multiple Choice', description: 'Questions with 4 answer options' },
    { id: 'true_false', label: 'True/False', description: 'Simple true or false questions' },
    { id: 'short_answer', label: 'Short Answer', description: 'Brief text responses' },
    { id: 'fill_blank', label: 'Fill in the Blank', description: 'Complete the missing words' }
  ]

  const handleQuestionTypeToggle = (typeId, checked) => {
    const currentTypes = settings.questionTypes || []
    let newTypes
    
    if (checked) {
      newTypes = [...currentTypes, typeId]
    } else {
      newTypes = currentTypes.filter(type => type !== typeId)
    }
    
    // Ensure at least one question type is selected
    if (newTypes.length === 0) {
      return
    }
    
    onQuestionTypesChange(newTypes)
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <CheckSquare className="h-5 w-5" />
        <span>Advanced Settings</span>
      </h3>

      {/* Question Types */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Question Types</label>
        <div className="grid grid-cols-1 gap-3">
          {questionTypeOptions.map((option) => (
            <div key={option.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
              <Checkbox
                id={option.id}
                checked={settings.questionTypes?.includes(option.id) || false}
                onCheckedChange={(checked) => handleQuestionTypeToggle(option.id, checked)}
              />
              <div className="flex-1">
                <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                  {option.label}
                </label>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time and Scoring Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Time Limit (minutes)</span>
          </label>
          <Select 
            value={settings.timeLimit?.toString()} 
            onValueChange={(value) => onSettingsChange('timeLimit', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="20">20 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Passing Score (%)</span>
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={settings.passingScore}
            onChange={(e) => onSettingsChange('passingScore', parseInt(e.target.value) || 0)}
            placeholder="70"
          />
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Quiz Options</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="randomize"
              checked={settings.randomizeQuestions || false}
              onCheckedChange={(checked) => onSettingsChange('randomizeQuestions', checked)}
            />
            <label htmlFor="randomize" className="text-sm">Randomize question order</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showResults"
              checked={settings.showResultsImmediately !== false}
              onCheckedChange={(checked) => onSettingsChange('showResultsImmediately', checked)}
            />
            <label htmlFor="showResults" className="text-sm">Show results immediately after completion</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowRetake"
              checked={settings.allowRetake !== false}
              onCheckedChange={(checked) => onSettingsChange('allowRetake', checked)}
            />
            <label htmlFor="allowRetake" className="text-sm">Allow quiz retakes</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizSettings