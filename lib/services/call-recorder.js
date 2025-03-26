export class CallRecorder {
  constructor() {
    this.mediaRecorder = null
    this.recordedChunks = []
  }

  startRecording(stream) {
    try {
      this.recordedChunks = []
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(1000) // Record in 1-second chunks
      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      return false
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        })
        resolve(blob)
      }
      this.mediaRecorder.stop()
    })
  }
} 