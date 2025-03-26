import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export function useGamification(userId) {
  const { toast } = useToast()

  const handleAction = useCallback(async (action, data = {}) => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/gamification/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data })
      })

      if (!response.ok) throw new Error()

      const result = await response.json()
      
      // Show XP gain toast
      if (result.xpGained) {
        toast({
          title: "Experience Gained!",
          description: `+${result.xpGained} XP`,
          duration: 2000
        })
      }

      return result
    } catch (error) {
      console.error("Error handling gamification action:", error)
    }
  }, [userId])

  return { handleAction }
} 