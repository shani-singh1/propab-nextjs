"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Brain,
  MessageCircle,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react"

export function ConnectionDetails({ suggestion, onClose }) {
  const { user, compatibility, connectionNotes } = suggestion

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5" />
              <h3 className="font-semibold">Connection Insights</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compatibility Insights */}
          <div>
            <h4 className="font-medium mb-3">Why You Match</h4>
            <div className="space-y-3">
              {compatibility.insights.synergies.map((synergy, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{synergy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Opportunities */}
          <div>
            <h4 className="font-medium mb-3">Growth Opportunities</h4>
            <div className="space-y-3">
              {compatibility.insights.opportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span>{opportunity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Challenges */}
          <div>
            <h4 className="font-medium mb-3">Things to Consider</h4>
            <div className="space-y-3">
              {compatibility.insights.challenges.map((challenge, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>{challenge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Notes */}
          <div>
            <h4 className="font-medium mb-3">Conversation Starters</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Topics to Explore</h5>
                <div className="flex flex-wrap gap-2">
                  {connectionNotes.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-muted rounded-full text-xs"
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Ice Breakers</h5>
                <div className="space-y-2">
                  {connectionNotes.icebreakers.map((icebreaker, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>{icebreaker}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h4 className="font-medium mb-3">Recommended Next Steps</h4>
            <div className="space-y-2">
              {connectionNotes.nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 