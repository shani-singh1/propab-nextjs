import { io } from "socket.io-client"

export class WebRTCService {
  constructor(userId) {
    this.userId = userId
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)
    this.peerConnections = new Map()
    this.localStream = null
    this.onCallCallback = null
  }

  async initialize() {
    this.socket.on("call-request", this.handleCallRequest.bind(this))
    this.socket.on("call-accepted", this.handleCallAccepted.bind(this))
    this.socket.on("ice-candidate", this.handleIceCandidate.bind(this))
  }

  async startCall(partnerId, type = "voice") {
    const stream = await this.getMediaStream(type)
    this.localStream = stream

    const peerConnection = this.createPeerConnection(partnerId)
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream)
    })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    this.socket.emit("call-request", {
      to: partnerId,
      from: this.userId,
      type,
      offer
    })
  }

  async acceptCall(callerId, offer) {
    const stream = await this.getMediaStream(offer.type)
    this.localStream = stream

    const peerConnection = this.createPeerConnection(callerId)
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream)
    })

    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    this.socket.emit("call-accepted", {
      to: callerId,
      from: this.userId,
      answer
    })
  }

  onCall(callback) {
    this.onCallCallback = callback
  }

  private async getMediaStream(type) {
    const constraints = {
      audio: true,
      video: type === "video"
    }
    return navigator.mediaDevices.getUserMedia(constraints)
  }

  private createPeerConnection(partnerId) {
    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
        // Add TURN servers for production
      ]
    }

    const pc = new RTCPeerConnection(config)
    this.peerConnections.set(partnerId, pc)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          to: partnerId,
          candidate: event.candidate
        })
      }
    }

    pc.ontrack = (event) => {
      if (this.onCallCallback) {
        this.onCallCallback(event.streams[0])
      }
    }

    return pc
  }

  private async handleCallRequest({ from, offer }) {
    if (this.onCallCallback) {
      this.onCallCallback({ from, offer })
    }
  }

  private async handleCallAccepted({ from, answer }) {
    const pc = this.peerConnections.get(from)
    if (pc) {
      await pc.setRemoteDescription(answer)
    }
  }

  private async handleIceCandidate({ from, candidate }) {
    const pc = this.peerConnections.get(from)
    if (pc) {
      await pc.addIceCandidate(candidate)
    }
  }
} 