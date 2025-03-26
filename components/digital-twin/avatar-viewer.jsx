"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Card } from "@/components/ui/card"

export function AvatarViewer({ userId, personalityTraits }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Setup Three.js scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    containerRef.current.appendChild(renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 10, 10)
    scene.add(directionalLight)

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Position camera
    camera.position.z = 5

    // Load avatar model
    const loader = new GLTFLoader()
    loader.load(
      `/models/avatar.glb`,
      (gltf) => {
        sceneRef.current = gltf.scene
        scene.add(gltf.scene)
        
        // Apply personality traits to avatar appearance
        updateAvatarAppearance(gltf.scene, personalityTraits)
      },
      undefined,
      (error) => console.error("Error loading avatar:", error)
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      )
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Update avatar when personality traits change
  useEffect(() => {
    if (sceneRef.current && personalityTraits) {
      updateAvatarAppearance(sceneRef.current, personalityTraits)
    }
  }, [personalityTraits])

  return (
    <Card className="w-full aspect-square">
      <div ref={containerRef} className="w-full h-full" />
    </Card>
  )
}

function updateAvatarAppearance(avatarScene, traits) {
  // Map personality traits to visual characteristics
  const {
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism
  } = traits

  // Example: Adjust avatar colors based on traits
  avatarScene.traverse((child) => {
    if (child.isMesh) {
      // Extraversion affects vibrancy
      const vibrancy = 0.5 + (extraversion * 0.5)
      
      // Openness affects color variety
      const hue = openness * 360
      
      // Create material color
      child.material.color.setHSL(hue / 360, vibrancy, 0.5)
      
      // Neuroticism affects material roughness
      child.material.roughness = 0.5 + (neuroticism * 0.5)
      
      // Conscientiousness affects material metalness
      child.material.metalness = conscientiousness
    }
  })
} 