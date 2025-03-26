"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

export function TimeRangePicker({ value, onChange }) {
  const [startTime, setStartTime] = useState(value?.start || "09:00")
  const [endTime, setEndTime] = useState(value?.end || "17:00")

  useEffect(() => {
    onChange({ start: startTime, end: endTime })
  }, [startTime, endTime])

  const timeOptions = generateTimeOptions()

  return (
    <div className="flex items-center gap-2">
      <Select
        value={startTime}
        onValueChange={(value) => {
          if (value >= endTime) {
            setEndTime(incrementTime(value))
          }
          setStartTime(value)
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Start time" />
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map((time) => (
            <SelectItem
              key={time}
              value={time}
              disabled={time >= endTime}
            >
              {formatTime(time)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">to</span>

      <Select
        value={endTime}
        onValueChange={(value) => {
          if (value <= startTime) {
            setStartTime(decrementTime(value))
          }
          setEndTime(value)
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="End time" />
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map((time) => (
            <SelectItem
              key={time}
              value={time}
              disabled={time <= startTime}
            >
              {formatTime(time)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function generateTimeOptions() {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(time)
    }
  }
  return options
}

function formatTime(time) {
  const [hour, minute] = time.split(':')
  const hourNum = parseInt(hour)
  const period = hourNum >= 12 ? 'PM' : 'AM'
  const hour12 = hourNum % 12 || 12
  return `${hour12}:${minute} ${period}`
}

function incrementTime(time) {
  const [hour, minute] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hour, minute)
  date.setMinutes(date.getMinutes() + 30)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function decrementTime(time) {
  const [hour, minute] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hour, minute)
  date.setMinutes(date.getMinutes() - 30)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
} 