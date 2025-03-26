"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { InterestsStep } from "./interests-step"
import { PersonalityStep } from "./personality-step"

const STEPS = ["interests", "personality"]

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    interests: [],
    traits: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleNext = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error()

      toast.success("Profile created successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {currentStep === 0 && (
        <InterestsStep
          value={formData.interests}
          onChange={(interests) => setFormData(prev => ({ ...prev, interests }))}
        />
      )}

      {currentStep === 1 && (
        <PersonalityStep
          value={formData.traits}
          onChange={(traits) => setFormData(prev => ({ ...prev, traits }))}
        />
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Complete Setup"}
          </Button>
        )}
      </div>
    </div>
  )
} 