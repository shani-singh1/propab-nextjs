"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const PERSONALITY_QUESTIONS = [
  {
    id: "openness",
    question: "How do you approach new experiences?",
    options: [
      { value: "0.2", label: "I prefer familiar routines" },
      { value: "0.4", label: "I'm somewhat cautious about new things" },
      { value: "0.6", label: "I'm open to new experiences" },
      { value: "0.8", label: "I actively seek new experiences" },
      { value: "1.0", label: "I'm always looking for novel experiences" }
    ]
  },
  {
    id: "conscientiousness",
    question: "How do you approach tasks and responsibilities?",
    options: [
      { value: "0.2", label: "I'm quite flexible and spontaneous" },
      { value: "0.4", label: "I have a general plan but stay adaptable" },
      { value: "0.6", label: "I like having a structured approach" },
      { value: "0.8", label: "I'm very organized and methodical" },
      { value: "1.0", label: "I plan everything in detail" }
    ]
  },
  {
    id: "extraversion",
    question: "How do you prefer to interact with others?",
    options: [
      { value: "0.2", label: "I prefer solitary activities" },
      { value: "0.4", label: "I enjoy small group interactions" },
      { value: "0.6", label: "I'm comfortable in most social situations" },
      { value: "0.8", label: "I actively seek social interactions" },
      { value: "1.0", label: "I thrive in large social gatherings" }
    ]
  },
  {
    id: "agreeableness",
    question: "How do you typically handle conflicts?",
    options: [
      { value: "0.2", label: "I stand firm on my position" },
      { value: "0.4", label: "I consider others' views but maintain mine" },
      { value: "0.6", label: "I try to find middle ground" },
      { value: "0.8", label: "I often prioritize others' needs" },
      { value: "1.0", label: "I always seek harmony and consensus" }
    ]
  },
  {
    id: "neuroticism",
    question: "How do you handle stress and emotions?",
    options: [
      { value: "0.2", label: "I stay calm in most situations" },
      { value: "0.4", label: "I occasionally feel stressed" },
      { value: "0.6", label: "I'm sensitive to pressure" },
      { value: "0.8", label: "I often feel anxious or worried" },
      { value: "1.0", label: "I'm very emotionally sensitive" }
    ]
  }
]

export function PersonalityStep({ onComplete }) {
  const [answers, setAnswers] = useState({})

  const handleSubmit = async () => {
    if (Object.keys(answers).length < PERSONALITY_QUESTIONS.length) {
      return
    }

    try {
      const response = await fetch("/api/onboarding/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traits: answers })
      })

      if (!response.ok) throw new Error()
      
      onComplete()
    } catch (error) {
      console.error("Failed to save personality traits:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Personality Assessment</h2>
        <p className="text-muted-foreground">
          Help us understand your personality better
        </p>
      </div>

      <div className="space-y-8">
        {PERSONALITY_QUESTIONS.map((question) => (
          <Card key={question.id} className="p-6">
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            <RadioGroup
              value={answers[question.id]}
              onValueChange={(value) =>
                setAnswers(prev => ({ ...prev, [question.id]: value }))
              }
            >
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <RadioGroupItem
                      value={option.value}
                      id={`${question.id}-${option.value}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="ml-2"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < PERSONALITY_QUESTIONS.length}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  )
} 