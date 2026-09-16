import React, { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const DISMISS_KEY = 'mercato_pwa_install_dismissed_at'
const DISMISS_DAYS = 14

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIosHint, setIsIosHint] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DAYS * 24 * 60 * 60 * 1000) return

    if (isIos()) {
      setIsIosHint(true)
      setIsVisible(true)
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }
    const handleInstalled = () => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
      setIsVisible(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setIsVisible(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-[#171717] text-white rounded-2xl shadow-2xl border border-white/10 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFD43B] text-[#171717] flex items-center justify-center shrink-0">
          <Download size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold">Installer Mercato</p>
          {isIosHint ? (
            <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed flex items-center gap-1 flex-wrap">
              Appuyez sur <Share size={12} className="inline text-[#FFD43B]" /> puis "Sur l'écran d'accueil"
            </p>
          ) : (
            <p className="text-[11px] text-zinc-300 mt-0.5">Accès plus rapide, plein écran, comme une vraie app.</p>
          )}
          {!isIosHint && (
            <button
              onClick={handleInstall}
              className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-[#FFD43B] text-[#171717] text-[11px] font-extrabold hover:brightness-105 transition-all"
            >
              Installer
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
