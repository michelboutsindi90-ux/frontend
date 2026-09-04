import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  CreditCard,
  Boxes,
  RefreshCw,
  AlertCircle,
  RotateCw,
  ScanLine,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/apiClient'
import { GoldenStageBackground } from '../ui/GoldenStageBackground'

interface AuthViewProps {
  initialMode?: 'login' | 'register'
}

export function AuthView({ initialMode = 'login' }: AuthViewProps) {
  const { login, register } = useAuth()

  const [isFlipped, setIsFlipped] = useState(initialMode === 'register')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [fullName, setFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMorphedSuccess, setIsMorphedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }
  const passStrength = getPasswordStrength(registerPassword)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.')
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
      setIsMorphedSuccess(true)
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Connexion impossible. Réessayez.')
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName.trim() || !registerEmail.trim() || registerPassword.length < 8) {
      setErrorMessage('Veuillez remplir tous les champs (mot de passe : 8 caractères minimum).')
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        email: registerEmail.trim(),
        password: registerPassword,
        fullName: fullName.trim(),
        phone: registerPhone.trim() || undefined,
      })
      setIsMorphedSuccess(true)
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Inscription impossible. Réessayez.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0D] text-[#FAFAFA] relative overflow-hidden flex flex-col selection:bg-[#FFD43B] selection:text-[#0C0C0E]">
      <GoldenStageBackground showPodium={true} showParticles={true} intensity="high" />

      {/* Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] text-[#0C0C0E] flex items-center justify-center font-display font-bold text-xl shadow-md shadow-[#FFD43B]/25">
            M
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white">Mercato</span>
            <p className="text-xs text-zinc-400">Caisse & Gestion de Boutiques</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsFlipped(!isFlipped)
            setErrorMessage(null)
          }}
          className="px-3 sm:px-4 py-2 rounded-xl bg-[#18181D] hover:bg-[#222228] text-xs font-semibold text-zinc-200 border border-white/[0.1] hover:border-[#FFD43B]/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
        >
          <RotateCw size={13} className="text-[#FFD43B] shrink-0" />
          <span>{isFlipped ? 'Se connecter' : 'Créer un compte'}</span>
        </button>
      </header>

      {/* Main */}
      <main className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center flex-1">
        {/* Left: value props */}
        <div className="lg:col-span-6 space-y-7 order-2 lg:order-1">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181D] border border-[#FFD43B]/25 text-xs font-medium text-zinc-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFD43B] animate-pulse" />
              <span>Congo & Afrique Centrale</span>
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight tracking-tight">
              Pilotez votre boutique en temps réel.
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Stock, catalogue et encaissement en caisse — tout au même endroit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#141418]/90 backdrop-blur-md border border-white/[0.08] space-y-2 shadow-lg">
              <div className="w-8 h-8 rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] flex items-center justify-center border border-[#FFD43B]/20">
                <CreditCard size={16} />
              </div>
              <p className="text-xs font-bold text-white">Caisse rapide</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141418]/90 backdrop-blur-md border border-white/[0.08] space-y-2 shadow-lg">
              <div className="w-8 h-8 rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] flex items-center justify-center border border-[#FFD43B]/20">
                <Boxes size={16} />
              </div>
              <p className="text-xs font-bold text-white">Stock en direct</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141418]/90 backdrop-blur-md border border-white/[0.08] space-y-2 shadow-lg">
              <div className="w-8 h-8 rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] flex items-center justify-center border border-[#FFD43B]/20">
                <ScanLine size={16} />
              </div>
              <p className="text-xs font-bold text-white">Scan QR produit</p>
            </div>
          </div>
        </div>

        {/* Right: Flip Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto relative order-1 lg:order-2">
          <div className="relative w-full min-h-[460px]" style={{ perspective: '1400px' }}>
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full h-full relative"
            >
              {/* FRONT: Login */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                className="w-full bg-[#141418]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] hover:border-[#FFD43B]/30 p-6 sm:p-7 shadow-2xl relative transition-colors duration-300"
              >
                <div className="mb-5 pb-4 border-b border-white/[0.08]">
                  <h2 className="text-lg font-display font-bold text-white">Connexion</h2>
                  <p className="text-xs text-zinc-400">Accédez à votre espace commerçant</p>
                </div>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2"
                    >
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-400">Email professionnel</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@boutique.cg"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] focus:ring-1 focus:ring-[#FFD43B] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">Mot de passe</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] focus:ring-1 focus:ring-[#FFD43B] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-[#FFD43B] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isMorphedSuccess
                          ? 'bg-emerald-500 text-white'
                          : isSubmitting
                          ? 'bg-[#FFD43B] text-[#171717] opacity-90'
                          : 'bg-[#FFD43B] hover:bg-[#F5C72B] text-[#171717] shadow-[#FFD43B]/30'
                      }`}
                    >
                      {isMorphedSuccess ? (
                        <span className="flex items-center gap-1.5">
                          <Check size={16} strokeWidth={3} />
                          <span>Connexion réussie</span>
                        </span>
                      ) : isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Vérification en cours...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span>Accéder au tableau de bord</span>
                          <ArrowRight size={14} />
                        </span>
                      )}
                    </motion.button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(true)
                        setErrorMessage(null)
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Pas encore de compte ?{' '}
                      <span className="text-[#FFD43B] hover:underline font-semibold">Créer un compte</span>
                    </button>
                  </div>
                </form>

                <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                  <ShieldCheck size={14} className="text-[#FFD43B]" />
                  <span>Connexion sécurisée</span>
                </div>
              </div>

              {/* BACK: Register */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 w-full h-full bg-[#141418]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] hover:border-[#FFD43B]/30 p-6 sm:p-7 shadow-2xl flex flex-col justify-between overflow-y-auto transition-colors duration-300"
              >
                <div>
                  <div className="mb-4 pb-3 border-b border-white/[0.08]">
                    <h2 className="text-lg font-display font-bold text-white">Créer un compte</h2>
                    <p className="text-xs text-zinc-400">Vous pourrez créer votre première boutique ensuite</p>
                  </div>

                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2"
                      >
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-zinc-400">Nom & Prénoms *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="ex: Rodrigue Mpassi"
                        className="w-full px-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-zinc-400">Email *</label>
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="contact@boutique.cg"
                        className="w-full px-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-zinc-400">
                        Téléphone <span className="text-zinc-600">(optionnel)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <Phone size={13} />
                        </div>
                        <input
                          type="text"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          placeholder="+242 06 650 12 34"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-zinc-400">Mot de passe *</label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="8 caractères minimum"
                          className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-[#FFD43B]"
                        >
                          {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>

                      {registerPassword && (
                        <div className="flex gap-1 h-1 pt-1">
                          {[1, 2, 3, 4].map((s) => (
                            <div
                              key={s}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                passStrength >= s ? 'bg-[#FFD43B]' : 'bg-white/[0.08]'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          isMorphedSuccess
                            ? 'bg-emerald-500 text-white'
                            : isSubmitting
                            ? 'bg-[#FFD43B] text-[#171717] opacity-90'
                            : 'bg-[#FFD43B] hover:bg-[#F5C72B] text-[#171717] shadow-[#FFD43B]/30'
                        }`}
                      >
                        {isMorphedSuccess ? (
                          <span className="flex items-center gap-1.5">
                            <Check size={16} strokeWidth={3} />
                            <span>Compte créé !</span>
                          </span>
                        ) : isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw size={15} className="animate-spin" />
                            <span>Création en cours...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span>Créer mon compte</span>
                            <ArrowRight size={14} />
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                <div className="text-center pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false)
                      setErrorMessage(null)
                    }}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Déjà inscrit ? <span className="text-[#FFD43B] hover:underline font-semibold">Se connecter</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 text-center text-xs text-zinc-500">
        © 2026 Mercato • Gestion commerciale & Caisse
      </footer>
    </div>
  )
}
