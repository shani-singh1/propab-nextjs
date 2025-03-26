"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Image, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function FileUpload({ onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) throw new Error()
      
      const data = await response.json()
      onUpload({
        type: file.type.startsWith("image/") ? "image" : "file",
        url: data.url,
        name: file.name,
        size: file.size
      })
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Paperclip className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Maximum file size: 5MB
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 