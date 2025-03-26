"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ChatSettings({ chatId }) {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    readReceipts: true
  })
  const { toast } = useToast()

  const handleSettingChange = async (key, value) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      })

      if (!response.ok) throw new Error()
      
      setSettings(prev => ({ ...prev, [key]: value }))
      toast.success("Settings updated")
    } catch (error) {
      toast.error("Failed to update settings")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => 
                handleSettingChange("notifications", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound">Message Sounds</Label>
            <Switch
              id="sound"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => 
                handleSettingChange("soundEnabled", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="readReceipts">Read Receipts</Label>
            <Switch
              id="readReceipts"
              checked={settings.readReceipts}
              onCheckedChange={(checked) => 
                handleSettingChange("readReceipts", checked)
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 