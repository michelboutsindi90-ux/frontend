import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Sparkles, Lock, Mail, Phone, ArrowRight, Check, Store, Eye, EyeOff, Maximize2 } from 'lucide-react'
import confetti from 'canvas-confetti'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  user: { name: string; email: string; storeName: string }
  onLoginSuccess: (userData: { name: string; email: string; storeName: string }) => void
  onOpenFullPage?: () => void
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onOpenFullPage,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [emailOrPhone, setEmailOrPhone] = useState(user.email)
  const [password, setPassword] = useState('Mercato2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [storeNameInput, setStoreNameInput] = useState(user.storeName)
  const [userNameInput, setUserNameInput] = useState(user.name)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      onLoginSuccess({
        name: userNameInput || 'Kouamé Diallo',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'merchant@mercatoboutique.com',
        storeName: storeNameInput || 'Mercato Concept Store',
      })
      setIsLoading(false)
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD43B', '#171717'],
        })
      } catch (err) {}
      onClose()
    }, 600)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-b from-[#FFF4BF]/50 to-white text-center relative border-b border-stone-100">
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              {onOpenFullPage && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenFullPage()
                  }}
                  title="Ouvrir en plein écran"
                  className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center text-stone-600 shadow-2xs transition-colors"
                >
                  <Maximize2 size={14} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center text-stone-600 shadow-2xs transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#FFD43B] text-[#171717] flex items-center justify-center mx-auto shadow-md shadow-[#FFD43B]/40 mb-3">
              <Store size={24} />
            </div>

            <h2 className="text-xl font-extrabold text-[#171717]">
              {mode === 'login' ? 'Connexion Mercato' : 'Créer ma boutique en 2 min'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {mode === 'login'
                ? 'Accédez à votre tableau de bord commerçant'
                : 'Rejoignez plus de 1 200 commerçants actifs'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Nom & Prénoms
                  </label>
                  <input
                    type="text"
                    required
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="ex: Aminata Traoré"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Nom de votre boutique
                  </label>
                  <input
                    type="text"
                    required
                    value={storeNameInput}
                    onChange={(e) => setStoreNameInput(e.target.value)}
                    placeholder="ex: Maison du Cuir & Wax"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Email ou Numéro de téléphone
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="kouame@gmail.com ou +225 07..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#171717]">Mot de passe</label>
                {mode === 'login' && (
                  <span className="text-[11px] font-semibold text-stone-500">
                    Sécurisé SSL
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-lg shadow-[#FFD43B]/40 hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Vérification...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Se connecter' : 'Lancer ma boutique'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs font-bold text-stone-600 hover:text-[#171717]"
              >
                {mode === 'login'
                  ? "Créer une boutique"
                  : 'Se connecter'}
              </button>

              {onOpenFullPage && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenFullPage()
                  }}
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Page animée & Démo</span>
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
