"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { GitBranch, Plus } from "lucide-react"
import { MemorySelector } from "./memory-selector"
import { TimelineSuggestions } from "./timeline-suggestions"

export function NewTimelineModal({ isOpen, onClose, onCreateTimeline }) {
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [variables, setVariables] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onCreateTimeline(selectedMemory.id, variables)
      onClose()
      toast.success("Timeline created successfully")
    } catch (error) {
      toast.error("Failed to create timeline")
    } finally {
      setIsLoading(false)
    }
  }

  const addVariable = () => {
    setVariables(prev => ({
      ...prev,
      [`variable${Object.keys(prev).length + 1}`]: ""
    }))
  }

  const handleSuggestionSelect = (suggestion) => {
    setVariables(suggestion.variables)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Timeline</DialogTitle>
          <DialogDescription>
            Choose a memory point and specify what would be different
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Select Memory Point</Label>
              <MemorySelector
                userId={userId}
                onSelect={setSelectedMemory}
              />
            </div>

            <div>
              <Label>What would be different?</Label>
              <div className="mt-2 space-y-3">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key}>
                    <Input
                      value={value}
                      onChange={(e) =>
                        setVariables(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))
                      }
                      placeholder={`Change ${key}`}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariable}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </div>

            <div>
              <Label>Additional Context</Label>
              <Textarea
                className="mt-2"
                placeholder="Provide any additional context about this alternate timeline"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Create Timeline
            </Button>
          </div>
        </form>

        {selectedMemory && (
          <div className="mt-6">
            <TimelineSuggestions
              memory={selectedMemory}
              onSelect={handleSuggestionSelect}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 