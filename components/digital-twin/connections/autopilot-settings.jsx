"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { TimeRangePicker } from "@/components/ui/time-range-picker"
import { Settings, Plus, X, Clock } from "lucide-react"

export function AutopilotSettings({ isOpen, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState({ ...settings })
  const [activeHours, setActiveHours] = useState({
    start: "09:00",
    end: "17:00"
  })

  useEffect(() => {
    if (settings.activeHours) {
      setActiveHours(settings.activeHours)
    }
  }, [settings])

  const handleSave = () => {
    onSave({
      ...localSettings,
      activeHours
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Autopilot Settings</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Maximum Connections per Run</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={localSettings.maxConnections}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  maxConnections: parseInt(e.target.value)
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Compatibility Score</Label>
              <div className="space-y-2">
                <Slider
                  value={[localSettings.minCompatibility * 100]}
                  onValueChange={([value]) => setLocalSettings(prev => ({
                    ...prev,
                    minCompatibility: value / 100
                  }))}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>{Math.round(localSettings.minCompatibility * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Send Automated Messages</Label>
              <Switch
                checked={localSettings.autoMessage}
                onCheckedChange={(checked) => setLocalSettings(prev => ({
                  ...prev,
                  autoMessage: checked
                }))}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Active Hours</Label>
              <TimeRangePicker
                value={activeHours}
                onChange={setActiveHours}
              />
              <p className="text-sm text-muted-foreground">
                Autopilot will only run during these hours
              </p>
            </div>

            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <div className="flex flex-wrap gap-2">
                {["skills", "interests", "goals", "personality", "industry"].map((area) => (
                  <Badge
                    key={area}
                    variant={localSettings.focusAreas.includes(area) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      focusAreas: prev.focusAreas.includes(area)
                        ? prev.focusAreas.filter(a => a !== area)
                        : [...prev.focusAreas, area]
                    }))}
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 