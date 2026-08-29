import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react'
import {
  Store,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  CreditCard,
  Building2,
  Users,
  ChevronRight,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RotateCw,
  Sparkles,
  Zap,
  Layers,
  ShoppingBag,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { StoreConfig } from '../../types'
import { GoldenStageBackground } from '../ui/GoldenStageBackground'

interface AuthViewProps {
  onLoginSuccess: (userData: {
    name: string
    email: string
    storeName: string
    role?: 'owner' | 'cashier' | 'admin'
    selectedStore?: StoreConfig
  }) => void
  currentStores: StoreConfig[]
  onBackToApp?: () => void
  initialMode?: 'login' | 'register'
}

type LoginMethod = 'password' | 'otp'

export function AuthView({
  onLoginSuccess,
  currentStores = [],
  onBackToApp,
  initialMode = 'login',
}: AuthViewProps) {
  // Flip State (false = Login, true = Register)
  const [isFlipped, setIsFlipped] = useState(initialMode === 'register')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password')

  // Form Inputs - Login
  const [emailOrPhone, setEmailOrPhone] = useState('mabiala@mercatoboutique.cg')
  const [password, setPassword] = useState('Mercato2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Registration Inputs
  const [fullName, setFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPhone, setRegisterPhone] = useState('+242 06 ')
  const [storeName, setStoreName] = useState('')
  const [storeCategory, setStoreCategory] = useState<'fashion' | 'electronics' | 'wholesale' | 'cosmetics' | 'food' | 'general'>('fashion')
  const [storeCity, setStoreCity] = useState('Brazzaville')
  const [registerPassword, setRegisterPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(45)
  const [isOtpSent, setIsOtpSent] = useState(false)

  // Forgot password modal
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMorphedSuccess, setIsMorphedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 1. DYNAMIC MOUSE SPOTLIGHT (Following cursor)
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500)
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 500)
  const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 20 })

  // 2. 3D CARD TILT ON MOUSE
  const cardRotateX = useTransform(smoothMouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 800], [7, -7])
  const cardRotateY = useTransform(smoothMouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1200], [-7, 7])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Countdown timer for OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isOtpSent, otpTimer])

  // Password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }
  const passStrength = getPasswordStrength(isFlipped ? registerPassword : password)

  // Handle OTP input navigation
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (loginMethod === 'otp' && !isOtpSent) {
      setIsOtpSent(true)
      setOtpTimer(45)
      return
    }

    if (loginMethod === 'otp' && isOtpSent && otpDigits.join('').length < 6) {
      setErrorMessage('Veuillez saisir le code de vérification à 6 chiffres.')
      return
    }

    if (loginMethod === 'password' && !emailOrPhone.trim()) {
      setErrorMessage('Veuillez renseigner votre email ou numéro de téléphone.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      setIsMorphedSuccess(true)

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD43B', '#FFE066', '#FFFFFF', '#F59E0B'],
        })
      } catch (err) {}

      setTimeout(() => {
        const storeMatch = currentStores[0]
        onLoginSuccess({
          name: emailOrPhone.includes('mabiala') ? 'Grâce Mabiala' : 'Commerçant Mercato Congo',
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\s+/g, '')}@mercatoboutique.cg`,
          storeName: storeMatch ? storeMatch.name : 'Mercato Congo Concept Store',
          role: 'owner',
          selectedStore: storeMatch,
        })
      }, 750)
    }, 950)
  }

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName.trim() || !storeName.trim() || !registerPassword) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      setIsMorphedSuccess(true)

      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#FFD43B', '#10B981', '#FFFFFF'],
        })
      } catch (err) {}

      setTimeout(() => {
        onLoginSuccess({
          name: fullName,
          email: registerEmail || `contact@${storeName.toLowerCase().replace(/\s+/g, '')}.cg`,
          storeName: storeName,
          role: 'owner',
        })
      }, 750)
    }, 950)
  }

  // Quick Demo Preset Login
  const handleQuickDemoLogin = (preset: {
    name: string
    email: string
    storeName: string
    role: 'owner' | 'cashier' | 'admin'
    storeId?: string
  }) => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsMorphedSuccess(true)
      setTimeout(() => {
        const matchedStore = currentStores.find((s) => s.id === preset.storeId) || currentStores[0]
        onLoginSuccess({
          name: preset.name,
          email: preset.email,
          storeName: preset.storeName,
          role: preset.role,
          selectedStore: matchedStore,
        })
      }, 650)
    }, 650)
  }

  // Elastic Spring Variant for staggered fields
  const fieldItemVariants = {
    hidden: { opacity: 0, x: -16, scale: 0.96 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 380,
        damping: 18,
        mass: 0.6,
        delay: i * 0.045,
      },
    }),
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0D] text-[#FAFAFA] relative overflow-hidden flex flex-col justify-between selection:bg-[#FFD43B] selection:text-[#0C0C0E]">
      
      {/* 1. SCENOGRAPHIC GOLDEN STAGE BACKGROUND (Inspired by the Luxury Golden Ribbon Stage) */}
      <GoldenStageBackground showPodium={true} showParticles={true} intensity="high" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] text-[#0C0C0E] flex items-center justify-center font-black text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Mercato</span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FFD43B]/10 text-[#FFD43B] border border-[#FFD43B]/20 flex items-center gap-1">
                <Sparkles size={10} />
                <span>Prestige</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">Caisse POS & Gestion Multi-Boutiques</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Flip Mode Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setIsFlipped(!isFlipped)
              setErrorMessage(null)
            }}
            className="px-4 py-2 rounded-xl bg-[#18181D] hover:bg-[#222228] text-xs font-semibold text-zinc-200 border border-white/[0.1] hover:border-[#FFD43B]/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <RotateCw size={13} className={isFlipped ? 'rotate-180 transition-transform duration-500 text-[#FFD43B]' : 'transition-transform duration-500 text-[#FFD43B]'} />
            <span>{isFlipped ? 'Se connecter' : 'Créer un compte'}</span>
          </button>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300 border border-white/[0.08] flex items-center gap-1.5 transition-colors"
            >
              <span>Dashboard</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </header>

      {/* Main SaaS Arena */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center flex-1">
        
        {/* Left Column: SaaS Value Proposition */}
        <div className="lg:col-span-6 space-y-7">
          
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181D] border border-[#FFD43B]/25 text-xs font-medium text-zinc-200 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#FFD43B] animate-pulse" />
              <span>Conçu pour le commerce en République du Congo & Afrique Centrale</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
            >
              Pilotez l'ensemble de vos points de vente en temps réel.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg"
            >
              Synchronisez vos stocks, enregistrez vos ventes en caisse avec les paiements mobiles (MTN Mobile Money, Airtel Money) et suivez votre rentabilité sur une plateforme unique.
            </motion.p>
          </div>

          {/* Key Product Capabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg">
            <motion.div
              whileHover={{ y: -3, borderColor: 'rgba(255, 212, 59, 0.35)' }}
              className="p-4 rounded-2xl bg-[#141418]/90 backdrop-blur-md border border-white/[0.08] space-y-2 transition-colors shadow-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] flex items-center justify-center border border-[#FFD43B]/20">
                <CreditCard size={17} />
              </div>
              <p className="text-sm font-bold text-white">Caisse POS & Encaissement</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Encaissement rapide en espèces, MTN MoMo et Airtel Money avec tickets digitaux.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, borderColor: 'rgba(255, 212, 59, 0.35)' }}
              className="p-4 rounded-2xl bg-[#141418]/90 backdrop-blur-md border border-white/[0.08] space-y-2 transition-colors shadow-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] flex items-center justify-center border border-[#FFD43B]/20">
                <Building2 size={17} />
              </div>
              <p className="text-sm font-bold text-white">Gestion Multi-Boutiques</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Centralisez plusieurs dépôts, boutiques physiques à Brazzaville & Pointe-Noire.
              </p>
            </motion.div>
          </div>

          {/* Quick Demo Fast Access */}
          <div className="p-4 rounded-2xl bg-[#141418]/90 backdrop-blur-md border border-white/[0.08] max-w-lg space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Zap size={13} className="text-[#FFD43B]" />
                <span>Accès rapide démo (1 clic) :</span>
              </span>
              <span className="text-[11px] text-zinc-400">Comptes pré-configurés</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    name: 'Grâce Mabiala',
                    email: 'grace@mercatoboutique.cg',
                    storeName: 'Mercato Maison & Concept',
                    role: 'owner',
                    storeId: 'store-1',
                  })
                }
                className="p-2.5 rounded-xl bg-[#18181E] hover:bg-[#22222A] hover:border-[#FFD43B]/40 border border-white/[0.08] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold text-white group-hover:text-[#FFD43B] transition-colors">Gérant</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD43B]" />
                </div>
                <p className="text-[10px] text-zinc-400 truncate">Grâce Mabiala</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    name: 'Rodrigue Mpassi',
                    email: 'rodrigue@mercatoboutique.cg',
                    storeName: 'Boutique Sape & Élégance',
                    role: 'cashier',
                    storeId: 'store-2',
                  })
                }
                className="p-2.5 rounded-xl bg-[#18181E] hover:bg-[#22222A] hover:border-emerald-400/40 border border-white/[0.08] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Caisse POS</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-zinc-400 truncate">Rodrigue Mpassi</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    name: 'Dieudonné Ondongo',
                    email: 'admin@mercatoboutique.cg',
                    storeName: 'Dépôt Grossiste Congo-Océan',
                    role: 'admin',
                    storeId: 'store-3',
                  })
                }
                className="p-2.5 rounded-xl bg-[#18181E] hover:bg-[#22222A] hover:border-sky-400/40 border border-white/[0.08] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">Grossiste</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                </div>
                <p className="text-[10px] text-zinc-400 truncate">D. Ondongo</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Flip Card Container */}
        <motion.div
          style={{
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            transformStyle: 'preserve-3d',
          }}
          className="lg:col-span-6 w-full max-w-md mx-auto relative z-30"
        >
          <div
            className="relative w-full min-h-[530px]"
            style={{
              perspective: '1400px',
              transformStyle: 'preserve-3d',
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="w-full h-full relative"
            >
              {/* ========================================================= */}
              {/* FRONT FACE: CONNEXION                                    */}
              {/* ========================================================= */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="w-full bg-[#141418]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] hover:border-[#FFD43B]/30 p-6 sm:p-7 shadow-2xl relative transition-colors duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.08]">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Connexion</span>
                    </h2>
                    <p className="text-xs text-zinc-400">Accédez à votre espace commerçant</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(true)
                      setErrorMessage(null)
                    }}
                    title="Basculer vers Inscription (3D Flip)"
                    className="p-2.5 rounded-xl bg-[#18181D] hover:bg-[#222228] text-zinc-300 hover:text-[#FFD43B] border border-white/[0.08] hover:border-[#FFD43B]/40 transition-all cursor-pointer"
                  >
                    <RotateCw size={15} />
                  </button>
                </div>

                {/* Login Method Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-[#0C0C0F] border border-white/[0.08] mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('password')
                      setErrorMessage(null)
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      loginMethod === 'password'
                        ? 'bg-[#18181D] text-[#FFD43B] border border-white/[0.08] shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Email / Mot de passe
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp')
                      setErrorMessage(null)
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      loginMethod === 'otp'
                        ? 'bg-[#18181D] text-[#FFD43B] border border-white/[0.08] shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>SMS / WhatsApp</span>
                  </button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium flex items-center gap-2"
                    >
                      <AlertCircle size={15} className="shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form with Elastic Spring Stagger */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginMethod === 'password' ? (
                    <>
                      <motion.div
                        custom={1}
                        variants={fieldItemVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-1.5"
                      >
                        <label className="block text-xs font-medium text-zinc-300">
                          Email professionnel ou Numéro
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Mail size={15} />
                          </div>
                          <input
                            id="login-email-input"
                            type="text"
                            required
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            placeholder="mabiala@mercatoboutique.cg"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] focus:ring-1 focus:ring-[#FFD43B] transition-colors"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        custom={2}
                        variants={fieldItemVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-zinc-300">Mot de passe</label>
                          <button
                            type="button"
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-xs text-zinc-400 hover:text-[#FFD43B] transition-colors cursor-pointer"
                          >
                            Mot de passe oublié ?
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Lock size={15} />
                          </div>
                          <input
                            id="login-password-input"
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
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      custom={1}
                      variants={fieldItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3.5"
                    >
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                          Numéro WhatsApp ou Téléphone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Phone size={15} />
                          </div>
                          <input
                            type="text"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            placeholder="+242 06 650 12 34"
                            disabled={isOtpSent}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] focus:ring-1 focus:ring-[#FFD43B] transition-colors disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {isOtpSent && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-zinc-300">
                              Code reçu à 6 chiffres
                            </label>
                            <span className="text-[11px] text-[#FFD43B] font-medium">
                              {otpTimer > 0 ? `${otpTimer}s restantes` : 'Expiré'}
                            </span>
                          </div>

                          <div className="grid grid-cols-6 gap-2">
                            {otpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                id={`otp-digit-${idx}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                className="w-full h-11 text-center text-base font-bold text-white bg-[#0C0C0F] border border-white/[0.15] rounded-xl outline-none focus:border-[#FFD43B] focus:ring-1 focus:ring-[#FFD43B] transition-colors"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Remember Me */}
                  <motion.div
                    custom={3}
                    variants={fieldItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-between pt-1"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-md accent-[#FFD43B] bg-[#0C0C0F] border-white/[0.1]"
                      />
                      <span className="text-xs text-zinc-400">Rester connecté</span>
                    </label>
                  </motion.div>

                  {/* Submit Button with Morphing Effect */}
                  <motion.div
                    custom={4}
                    variants={fieldItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="pt-2"
                  >
                    <motion.button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isMorphedSuccess
                          ? 'bg-emerald-500 text-white'
                          : isSubmitting
                          ? 'bg-[#FFD43B] text-[#0C0C0E] opacity-90'
                          : 'bg-[#FFD43B] hover:bg-[#F5C72B] text-[#0C0C0E]'
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
                          <span>
                            {loginMethod === 'otp' && !isOtpSent
                              ? 'Recevoir le code OTP'
                              : 'Accéder au tableau de bord'}
                          </span>
                          <ArrowRight size={14} />
                        </span>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Switch to Register */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(true)
                        setErrorMessage(null)
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Pas encore de compte ?{' '}
                      <span className="text-[#FFD43B] hover:underline font-semibold">
                        Créer une boutique
                      </span>
                    </button>
                  </div>
                </form>

                {/* Footer security */}
                <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                  <ShieldCheck size={14} className="text-[#FFD43B]" />
                  <span>Connexion chiffrée SSL 256-bit • Serveurs Régionaux CEMAC (Congo)</span>
                </div>
              </div>

              {/* ========================================================= */}
              {/* BACK FACE: CRÉATION DE BOUTIQUE (3D FLIP)                 */}
              {/* ========================================================= */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 w-full h-full bg-[#141418]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] hover:border-[#FFD43B]/30 p-6 sm:p-7 shadow-2xl flex flex-col justify-between overflow-y-auto transition-colors duration-300"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Créer une boutique</span>
                      </h2>
                      <p className="text-xs text-zinc-400">Essai gratuit 14 jours sans engagement</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false)
                        setErrorMessage(null)
                      }}
                      title="Basculer vers Connexion (3D Flip)"
                      className="p-2.5 rounded-xl bg-[#18181D] hover:bg-[#222228] text-zinc-300 hover:text-[#FFD43B] border border-white/[0.08] hover:border-[#FFD43B]/40 transition-all cursor-pointer"
                    >
                      <RotateCw size={15} />
                    </button>
                  </div>

                  {/* Register Form */}
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Nom & Prénoms *
                        </label>
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
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Nom de la Boutique *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="ex: Maison Sape & Élégance"
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Secteur d'activité
                        </label>
                        <select
                          value={storeCategory}
                          onChange={(e: any) => setStoreCategory(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white outline-none focus:border-[#FFD43B]"
                        >
                          <option value="fashion">Mode, Sape & Maroquinerie</option>
                          <option value="wholesale">Grossiste & Dépôt CEMAC</option>
                          <option value="electronics">High-Tech & Téléphonie</option>
                          <option value="cosmetics">Beauté & Cosmétiques</option>
                          <option value="food">Alimentation & Épicerie Fine</option>
                          <option value="general">Boutique & Bazar Général</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Ville / Commune
                        </label>
                        <input
                          type="text"
                          value={storeCity}
                          onChange={(e) => setStoreCity(e.target.value)}
                          placeholder="Brazzaville, Bacongo"
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Email Pro
                        </label>
                        <input
                          type="email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="contact@boutique.cg"
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          WhatsApp / Téléphone (MTN / Airtel) *
                        </label>
                        <input
                          type="text"
                          required
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          placeholder="+242 06 650 12 34"
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-zinc-300">
                        Mot de passe *
                      </label>
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
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
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
                                passStrength >= s ? 'bg-[#FFD43B]' : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Register Button */}
                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          isMorphedSuccess
                            ? 'bg-emerald-500 text-white'
                            : isSubmitting
                            ? 'bg-[#FFD43B] text-[#0C0C0E] opacity-90'
                            : 'bg-[#FFD43B] hover:bg-[#F5C72B] text-[#0C0C0E]'
                        }`}
                      >
                        {isMorphedSuccess ? (
                          <span className="flex items-center gap-1.5">
                            <Check size={16} strokeWidth={3} />
                            <span>Boutique créée !</span>
                          </span>
                        ) : isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw size={15} className="animate-spin" />
                            <span>Configuration en cours...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span>Créer ma Boutique</span>
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
                    Déjà inscrit ?{' '}
                    <span className="text-[#FFD43B] hover:underline font-semibold">
                      Se connecter
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#141418] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl relative"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] flex items-center justify-center mx-auto border border-[#FFD43B]/20">
                <KeyRound size={20} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Réinitialisation du mot de passe</h3>
                <p className="text-xs text-zinc-400">
                  Renseignez votre email ou numéro WhatsApp pour recevoir le lien de réinitialisation.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center space-y-2">
                  <CheckCircle2 size={22} className="mx-auto text-emerald-400" />
                  <p className="font-semibold">Lien de réinitialisation envoyé</p>
                  <p className="text-[11px] text-zinc-400">
                    Consultez vos messages pour réinitialiser vos identifiants.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(false)
                      setForgotSent(false)
                    }}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-white/[0.1] hover:bg-white/[0.15] text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setForgotSent(true)
                  }}
                  className="space-y-3.5"
                >
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Email ou WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="kouame@mercatoboutique.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0C0F] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FFD43B]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#FFD43B] hover:bg-[#F5C72B] text-[#0C0C0E] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Envoyer le lien
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 border-t border-white/[0.08]">
        <p>© 2026 Mercato • Gestion commerciale & Caisse POS</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-300 transition-colors cursor-pointer">Support WhatsApp</span>
          <span>•</span>
          <span className="hover:text-zinc-300 transition-colors cursor-pointer">Confidentialité</span>
          <span>•</span>
          <span className="hover:text-zinc-300 transition-colors cursor-pointer">Sécurité certifiée</span>
        </div>
      </footer>
    </div>
  )
}
