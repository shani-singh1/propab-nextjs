"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Medal, Lock, CheckCircle } from "lucide-react"

export function AchievementsGrid({ achievements }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Achievements</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AchievementCard({ achievement }) {
  const { name, description, progress, completed } = achievement

  return (
    <Card className={`relative overflow-hidden ${completed ? 'bg-accent' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{name}</h4>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            {completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {!completed && (
            <div className="space-y-1">
              <Progress
                value={progress * 100}
                className="h-1"
              />
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {completed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </CardContent>
    </Card>
  )
} 