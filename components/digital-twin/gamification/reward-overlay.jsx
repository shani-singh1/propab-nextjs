"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Gift, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

export function RewardOverlay({ reward, onClaim, onClose }) {
  const showConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500']
    })
  }

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-card p-8 rounded-lg shadow-lg border max-w-md w-full mx-4"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, delay: 0.2 }}
                onAnimationComplete={showConfetti}
                className="inline-block"
              >
                <Gift className="h-16 w-16 text-primary" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold">New Reward!</h2>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{reward.name}</h3>
                  <p className="text-muted-foreground">
                    {reward.description}
                  </p>
                  {reward.value && (
                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      <Star className="h-5 w-5" />
                      <span className="font-semibold">+{reward.value} XP</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Later
                  </Button>
                  <Button
                    onClick={() => {
                      onClaim()
                      showConfetti()
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Claim Reward
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 