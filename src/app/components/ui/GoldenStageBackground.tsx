import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react'

interface GoldenStageBackgroundProps {
  showPodium?: boolean
  showParticles?: boolean
  className?: string
  intensity?: 'high' | 'medium' | 'subtle'
}

export function GoldenStageBackground({
  showPodium = true,
  showParticles = true,
  className = '',
  intensity = 'high',
}: GoldenStageBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Mouse tracking for subtle parallax effect on ribbons and stage
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500)
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 500)
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 25 })
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 25 })

  const ribbonTiltX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1200], [-12, 12])
  const ribbonTiltY = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 800], [-8, 8])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Canvas for fine ambient golden dust particles & sparkles
  useEffect(() => {
    if (!showParticles) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let h = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      w = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      h = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    interface SparkleParticle {
      x: number
      y: number
      size: number
      vy: number
      vx: number
      opacity: number
      pulse: number
      color: string
      isSparkle: boolean
    }

    const colors = ['#FFD43B', '#FFE066', '#FFF4BF', '#F59E0B']
    const count = intensity === 'subtle' ? 20 : intensity === 'medium' ? 35 : 50

    const particles: SparkleParticle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.6,
      vy: -(Math.random() * 0.3 + 0.08),
      vx: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * 0.03 + 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      isSparkle: Math.random() > 0.75,
    }))

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p) => {
        p.y += p.vy
        p.x += p.vx
        p.opacity += Math.sin(Date.now() * p.pulse) * 0.006

        if (p.opacity > 0.8) p.opacity = 0.8
        if (p.opacity < 0.1) p.opacity = 0.1

        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        ctx.save()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0.1, Math.min(0.85, p.opacity))
        ctx.shadowBlur = p.isSparkle ? 6 : 2
        ctx.shadowColor = '#FFD43B'
        ctx.fill()

        // 4-point star for sparkle particles
        if (p.isSparkle && p.opacity > 0.4) {
          ctx.beginPath()
          ctx.moveTo(p.x - p.size * 2.2, p.y)
          ctx.lineTo(p.x + p.size * 2.2, p.y)
          ctx.moveTo(p.x, p.y - p.size * 2.2)
          ctx.lineTo(p.x, p.y + p.size * 2.2)
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 0.6
          ctx.globalAlpha = p.opacity * 0.7
          ctx.stroke()
        }

        ctx.restore()
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
    }
  }, [showParticles, intensity])

  const ribbonOpacity = intensity === 'subtle' ? 0.35 : intensity === 'medium' ? 0.6 : 0.85

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      
      {/* 1. SOLID DEEP CANVAS BASE */}
      <div className="absolute inset-0 bg-[#0A0A0D]" />

      {/* 2. TOP SPOTLIGHT CONE (Clean geometrical conical beam inspired by Golden Stage image) */}
      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[650px] md:w-[950px] h-[550px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 212, 59, 0.14) 0%, rgba(245, 199, 43, 0.04) 50%, transparent 80%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          opacity: intensity === 'subtle' ? 0.5 : 0.85,
        }}
      />

      {/* Top light source highlight */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-white/20 blur-xl rounded-full" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#FFD43B]/60 blur-md rounded-full" />

      {/* 3. ELEGANT 3D GOLDEN CURVED RIBBONS (Faithfully modeled after the reference image) */}
      <motion.div
        style={{
          x: ribbonTiltX,
          y: ribbonTiltY,
        }}
        className="absolute inset-0 w-full h-full"
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          style={{ opacity: ribbonOpacity }}
        >
          <defs>
            {/* Linear Metallic Gold Profiles (Controlled, sharp, not muddy) */}
            <linearGradient id="goldRibbonMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE58F" />
              <stop offset="25%" stopColor="#FFD43B" />
              <stop offset="50%" stopColor="#FFF9DB" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id="goldRibbonSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF9DB" />
              <stop offset="35%" stopColor="#FFD43B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            <linearGradient id="goldRibbonAccent" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFD43B" stopOpacity="0.1" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#FFE58F" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFD43B" stopOpacity="0.1" />
            </linearGradient>

            {/* Stage Podium Surface Fill */}
            <linearGradient id="stagePodiumFill" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#22222A" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#18181F" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#101014" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* BACKGROUND RIBBONS (Subtle, deeper in space)              */}
          {/* ======================================================== */}
          {/* Left Arching Background Ribbon */}
          <path
            d="M 120, -50 C 40, 250 80, 560 520, 710 C 650, 755 790, 755 920, 710 C 1360, 560 1400, 250 1320, -50"
            fill="none"
            stroke="url(#goldRibbonSecondary)"
            strokeWidth="3.5"
            strokeOpacity="0.45"
          />

          {/* Secondary Higher Background Ribbon */}
          <path
            d="M 280, -50 C 180, 200 240, 480 600, 640 C 680, 675 760, 675 840, 640 C 1200, 480 1260, 200 1160, -50"
            fill="none"
            stroke="url(#goldRibbonMain)"
            strokeWidth="2"
            strokeOpacity="0.35"
          />

          {/* ======================================================== */}
          {/* FOREGROUND SWOOPING RIBBONS (Curving from sides to base)  */}
          {/* ======================================================== */}
          
          {/* Left Swooping Main Ribbon (3D Ribbon Thick Band) */}
          <path
            d="M -60, 320 C 10, 480 120, 680 480, 750 C 620, 775 720, 775 720, 775 C 720, 775 620, 795 470, 770 C 100, 700 -20, 500 -80, 340 Z"
            fill="url(#goldRibbonMain)"
            opacity="0.75"
          />

          {/* Left Sharp Edge Light Line */}
          <path
            d="M -80, 320 C 0, 490 120, 690 480, 760 C 600, 785 720, 785 720, 785"
            fill="none"
            stroke="url(#goldRibbonAccent)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right Swooping Main Ribbon (3D Ribbon Thick Band) */}
          <path
            d="M 1500, 320 C 1430, 480 1320, 680 960, 750 C 820, 775 720, 775 720, 775 C 720, 775 820, 795 970, 770 C 1340, 700 1460, 500 1520, 340 Z"
            fill="url(#goldRibbonMain)"
            opacity="0.75"
          />

          {/* Right Sharp Edge Light Line */}
          <path
            d="M 1520, 320 C 1440, 490 1320, 690 960, 760 C 840, 785 720, 785 720, 785"
            fill="none"
            stroke="url(#goldRibbonAccent)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Center Lower Converging Arc Ribbon */}
          <path
            d="M -20, 620 C 260, 690 480, 780 720, 785 C 960, 780 1180, 690 1460, 620"
            fill="none"
            stroke="url(#goldRibbonMain)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />

          {/* Bright Lower Gold Laser Line */}
          <path
            d="M 60, 660 C 300, 720 500, 795 720, 797 C 940, 795 1140, 720 1380, 660"
            fill="none"
            stroke="#FFF4BF"
            strokeWidth="1.5"
            strokeOpacity="0.95"
          />

          {/* ======================================================== */}
          {/* STAGE PODIUM / RUNWAY (Catwalk in 3D perspective)       */}
          {/* ======================================================== */}
          {showPodium && (
            <g>
              {/* Podium Trapezoid Runway */}
              <polygon
                points="420,785 1020,785 1280,920 160,920"
                fill="url(#stagePodiumFill)"
                stroke="#FFD43B"
                strokeWidth="1"
                strokeOpacity="0.3"
              />

              {/* Stage Golden Top Bevel Edge */}
              <line
                x1="420"
                y1="785"
                x2="1020"
                y2="785"
                stroke="url(#goldRibbonAccent)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Stage Center Perspective Guide Line */}
              <line
                x1="720"
                y1="785"
                x2="720"
                y2="920"
                stroke="#FFD43B"
                strokeWidth="1"
                strokeOpacity="0.15"
              />
            </g>
          )}
        </svg>

        {/* Central Convergence Starburst Glow (Focal point where ribbons cross and light hits stage) */}
        <div className="absolute top-[86%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {/* Core White Sparkle */}
          <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_24px_#FFD43B] animate-pulse" />
          {/* Horizontal Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-1 bg-gradient-to-r from-transparent via-[#FFE58F] to-transparent opacity-80" />
          {/* Vertical Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-1 bg-gradient-to-b from-transparent via-[#FFFFFF] to-transparent opacity-75" />
        </div>
      </motion.div>

      {/* 4. FINE PARTICLES CANVAS LAYER */}
      {showParticles && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />}
    </div>
  )
}
