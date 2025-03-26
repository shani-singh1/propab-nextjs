"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"

export function AchievementOverlay({ achievement, onComplete }) {
  const showConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          onAnimationComplete={() => {
            showConfetti()
            setTimeout(onComplete, 3000)
          }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="bg-card p-6 rounded-lg shadow-lg border text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <Trophy className="h-12 w-12 text-yellow-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-2">Achievement Unlocked!</h2>
              <h3 className="text-lg font-semibold text-primary mb-1">
                {achievement.name}
              </h3>
              <p className="text-muted-foreground">
                {achievement.description}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 