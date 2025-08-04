"use client"
import React from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { Label } from '../../../../components/ui/label'
import { Checkbox } from '../../../../components/ui/checkbox'

function QuestionRenderer({ question, answer, onAnswerChange }) {
  if (!question) return null

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <RadioGroup value={answer || ''} onValueChange={onAnswerChange}>
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  const renderTrueFalse = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <RadioGroup value={answer || ''} onValueChange={onAnswerChange}>
        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
          <RadioGroupItem value="True" id="true" />
          <Label htmlFor="true" className="flex-1 cursor-pointer font-medium">
            True
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
          <RadioGroupItem value="False" id="false" />
          <Label htmlFor="false" className="flex-1 cursor-pointer font-medium">
            False
          </Label>
        </div>
      </RadioGroup>
    </div>
  )

  const renderShortAnswer = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <Input
        placeholder="Enter your answer..."
        value={answer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        className="text-base"
      />
      <p className="text-sm text-gray-500">
        Provide a brief, concise answer. Spelling and capitalization matter.
      </p>
    </div>
  )

  const renderFillBlank = () => {
    // For fill-in-the-blank, we'll show the question with a blank space
    const questionText = question.question
    const blankPattern = /___+|\[blank\]|\{blank\}/gi
    
    if (blankPattern.test(questionText)) {
      const parts = questionText.split(blankPattern)
      return (
        <div className="space-y-4">
          <div className="text-lg font-medium mb-4">
            {parts.map((part, index) => (
              <span key={index}>
                {part}
                {index < parts.length - 1 && (
                  <Input
                    className="inline-block w-32 mx-2"
                    placeholder="answer"
                    value={answer || ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                  />
                )}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Fill in the blank with the most appropriate answer.
          </p>
        </div>
      )
    } else {
      // Fallback to regular short answer if no blank pattern found
      return renderShortAnswer()
    }
  }

  const renderEssay = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <Textarea
        placeholder="Write your essay answer here..."
        value={answer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={8}
        className="text-base"
      />
      <p className="text-sm text-gray-500">
        Provide a detailed response. There is no strict word limit, but aim for completeness and clarity.
      </p>
    </div>
  )

  const renderMultipleSelect = () => {
    const selectedAnswers = Array.isArray(answer) ? answer : []
    
    const handleOptionToggle = (option, checked) => {
      let newAnswers
      if (checked) {
        newAnswers = [...selectedAnswers, option]
      } else {
        newAnswers = selectedAnswers.filter(a => a !== option)
      }
      onAnswerChange(newAnswers)
    }

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium mb-4">{question.question}</div>
        <p className="text-sm text-gray-600 mb-4">Select all that apply:</p>
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <Checkbox
                id={`option-${index}`}
                checked={selectedAnswers.includes(option)}
                onCheckedChange={(checked) => handleOptionToggle(option, checked)}
              />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render based on question type
  switch (question.type) {
    case 'multiple_choice':
      return renderMultipleChoice()
    case 'true_false':
      return renderTrueFalse()
    case 'short_answer':
      return renderShortAnswer()
    case 'fill_blank':
      return renderFillBlank()
    case 'essay':
      return renderEssay()
    case 'multiple_select':
      return renderMultipleSelect()
    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Unsupported question type: {question.type}</p>
        </div>
      )
  }
}

export default QuestionRenderer