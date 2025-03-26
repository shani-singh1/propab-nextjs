"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Monitor, Camera 
} from "lucide-react"
import { WebRTCService } from "@/lib/services/webrtc-service"
import { CallRecorder } from "@/lib/services/call-recorder"
import { useToast } from "@/hooks/use-toast"

export function CallInterface({ 
  userId, 
  partnerId, 
  partnerName, 
  partnerImage, 
  type = "voice",
  onEnd 
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [duration, setDuration] = useState(0)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const webrtcRef = useRef(null)
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef(null)

  useEffect(() => {
    webrtcRef.current = new WebRTCService(userId)
    webrtcRef.current.initialize()
    webrtcRef.current.onCall(handleIncomingStream)
    recorderRef.current = new CallRecorder()

    const timer = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      endCall()
    }
  }, [])

  const handleIncomingStream = (stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream
    }
    setIsConnected(true)
  }

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const endCall = async () => {
    const stream = localVideoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    onEnd?.()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleRecording = async () => {
    if (isRecording) {
      const recordedBlob = await recorderRef.current.stopRecording()
      const formData = new FormData()
      formData.append('file', recordedBlob)
      formData.append('type', type)
      formData.append('partnerId', partnerId)

      try {
        const response = await fetch('/api/calls/recording', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error()
        toast.success('Call recorded successfully')
      } catch (error) {
        toast.error('Failed to save recording')
      }
    } else {
      const stream = type === 'video' 
        ? remoteVideoRef.current.srcObject 
        : new MediaStream([...localVideoRef.current.srcObject.getAudioTracks()])

      const started = recorderRef.current.startRecording(stream)
      if (started) {
        toast.success('Recording started')
      } else {
        toast.error('Failed to start recording')
        return
      }
    }
    setIsRecording(!isRecording)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={partnerImage} alt={partnerName} />
              <AvatarFallback>{partnerName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{partnerName}</h3>
              <p className="text-sm text-muted-foreground">
                {isConnected ? formatDuration(duration) : "Connecting..."}
              </p>
            </div>
          </div>
          {type === "video" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                } else {
                  remoteVideoRef.current?.requestFullscreen()
                }
              }}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="relative h-full">
          {type === "video" && (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-48 h-36 rounded-lg object-cover border-2 border-background"
              />
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            {type === "video" && (
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleVideo}
              >
                {isVideoOff ? (
                  <VideoOff className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={endCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleRecording}
            >
              {isRecording ? (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full border-2 border-current" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 