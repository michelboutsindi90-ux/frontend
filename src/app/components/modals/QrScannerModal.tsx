import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import jsQR from 'jsqr'
import { X, ScanLine, AlertCircle, Loader2 } from 'lucide-react'

interface QrScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onDecoded: (token: string) => void
}

export function QrScannerModal({ isOpen, onClose, onDecoded }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setError(null)
    setIsStarting(true)

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setIsStarting(false)
        tick()
      } catch {
        if (!cancelled) {
          setError("Impossible d'accéder à la caméra. Vérifiez les permissions du navigateur.")
          setIsStarting(false)
        }
      }
    }

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const result = jsQR(imageData.data, imageData.width, imageData.height)
          if (result?.data) {
            onDecoded(result.data)
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [isOpen, onDecoded])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white mt-auto sm:my-auto rounded-t-3xl sm:rounded-3xl max-h-[92dvh] sm:max-h-none overflow-y-auto sm:overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0 shadow-2xl border border-stone-200"
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center justify-between gap-3 bg-[#FBFBFA]">
            <div className="flex items-center gap-2">
              <ScanLine size={18} className="text-[#171717]" />
              <h3 className="text-sm font-extrabold text-[#171717]">Scanner un QR code produit</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600">
              <X size={16} />
            </button>
          </div>

          <div className="relative aspect-square max-h-[65dvh] mx-auto w-full bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />

            {isStarting && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-xs">Ouverture de la caméra...</p>
              </div>
            )}

            {!isStarting && !error && (
              <div className="absolute inset-8 border-2 border-[#FFD43B] rounded-2xl pointer-events-none" />
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white p-6 text-center">
                <AlertCircle size={28} className="text-rose-400" />
                <p className="text-xs">{error}</p>
              </div>
            )}
          </div>

          <div className="p-4 text-center">
            <p className="text-[11px] text-stone-500">Centrez le QR code du produit dans le cadre.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
