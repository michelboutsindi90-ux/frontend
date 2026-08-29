import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Smartphone,
  Monitor,
  ShoppingBag,
  ExternalLink,
  Search,
  Sparkles,
  Heart,
  Star,
  Check,
  MessageSquare,
  ShieldCheck,
  Truck,
  Flame,
  Clock,
  Tag,
  Gift,
  Layers,
  ChevronRight,
  TrendingUp,
  Percent,
  Send,
  Eye,
  CheckCircle2,
  X,
  Plus,
  Minus,
  ArrowRight,
  Store,
} from 'lucide-react'
import { Product, StoreConfig, WholesaleTier } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import confetti from 'canvas-confetti'
import { GoldenStageBackground } from '../ui/GoldenStageBackground'

interface StorefrontPreviewViewProps {
  products: Product[]
  storeConfig: StoreConfig
  allStores?: StoreConfig[]
  onSwitchStore?: (store: StoreConfig) => void
}

export function StorefrontPreviewView({
  products,
  storeConfig,
  allStores = [],
  onSwitchStore,
}: StorefrontPreviewViewProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const [selectedTab, setSelectedTab] = useState<'all' | 'flash' | 'choice' | 'wholesale' | 'top'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([
    { product: products[0], quantity: 2 },
  ])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewQuantity, setQuickViewQuantity] = useState(1)
  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const [likedProductIds, setLikedProductIds] = useState<string[]>([])
  const [claimedCoupons, setClaimedCoupons] = useState<string[]>([])
  const [activeDiscount, setActiveDiscount] = useState<number>(0)
  const [recentBuyerToast, setRecentBuyerToast] = useState<{ name: string; city: string; item: string } | null>(null)

  // Countdown timer for Flash Deals
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 5, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulated live buyers ticker
  useEffect(() => {
    const buyers = [
      { name: 'Grâce M.', city: 'Brazzaville Bacongo', item: 'Sac Bandoulière Safari' },
      { name: 'Rodrigue P.', city: 'Pointe-Noire Lumumba', item: 'Écouteurs Pro ANC' },
      { name: 'Dieudonné O.', city: 'Brazzaville Poto-Poto', item: 'Perceuse Brushless 20V (Lot)' },
      { name: 'Chantal N.', city: 'Dolisie Centre', item: 'Sérum Éclat Safou & Baobab' },
      { name: 'Alain M.', city: 'Brazzaville Centre-ville', item: 'Café Grand Cru Mayombe 500g' },
    ]
    let index = 0
    const interval = setInterval(() => {
      setRecentBuyerToast(buyers[index % buyers.length])
      index++
      setTimeout(() => setRecentBuyerToast(null), 4000)
    }, 9000)
    return () => clearInterval(interval)
  }, [])

  // Filter products for the active store or global
  const storeProducts = products.filter(
    (p) => !p.storeId || p.storeId === storeConfig.id || p.category
  )

  const filteredProducts = storeProducts.filter((p) => {
    if (selectedTab === 'flash' && !p.isFlashDeal) return false
    if (selectedTab === 'choice' && !p.isChoice) return false
    if (selectedTab === 'wholesale' && !p.isWholesale) return false
    if (selectedTab === 'top' && (p.salesCount || 0) < 500) return false
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
    if (searchQuery.trim() && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const categories = ['all', ...Array.from(new Set(storeProducts.map((p) => p.category)))]

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => {
    // calculate tiered price if applicable
    const unitPrice = getTieredPrice(item.product, item.quantity)
    return sum + unitPrice * item.quantity
  }, 0)
  const finalCartTotal = Math.max(0, cartSubtotal - activeDiscount + (cartSubtotal > storeConfig.freeDeliveryThreshold ? 0 : storeConfig.deliveryFee))

  function getTieredPrice(product: Product, quantity: number): number {
    if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
      const applicableTier = [...product.wholesaleTiers]
        .reverse()
        .find((tier) => quantity >= tier.minQty)
      if (applicableTier) return applicableTier.unitPrice
    }
    return product.price
  }

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
    })

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#FFD43B', '#171717', '#FF6B00'],
      })
    } catch (e) {}
  }

  const handleToggleLike = (productId: string) => {
    setLikedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleClaimCoupon = (code: string, amount: number) => {
    if (!claimedCoupons.includes(code)) {
      setClaimedCoupons([...claimedCoupons, code])
      setActiveDiscount((prev) => prev + amount)
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#FFD43B', '#10B981', '#171717'],
        })
      } catch (e) {}
    }
  }

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product)
    setQuickViewQuantity(product.moq || 1)
    setSelectedImgIndex(0)
  }

  return (
    <div id="storefront-preview-view" className="space-y-6 pb-16">
      {/* Top Preview Controls & Store Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-lg font-black text-[#171717]">
              Aperçu Boutique Client & Vente en Ligne
            </h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFD43B] text-[#171717] uppercase">
              Live Storefront
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Boutique active : <strong className="text-stone-800">{storeConfig.name}</strong> •{' '}
            <code className="text-stone-600 font-mono">https://{storeConfig.slug}.mercatoboutique.com</code>
          </p>
        </div>

        {/* Store Selector & Viewport Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {allStores.length > 1 && onSwitchStore && (
            <div className="flex items-center gap-1.5 bg-[#F6F6F3] px-3 py-1.5 rounded-2xl border border-stone-200/60 text-xs">
              <Store size={14} className="text-stone-500" />
              <select
                value={storeConfig.id}
                onChange={(e) => {
                  const target = allStores.find((s) => s.id === e.target.value)
                  if (target) onSwitchStore(target)
                }}
                className="bg-transparent font-extrabold text-stone-800 outline-none cursor-pointer"
              >
                {allStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.typeLabel || s.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Device switcher */}
          <div className="bg-[#F6F6F3] p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Monitor size={15} />
              <span>Ordinateur</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Smartphone size={15} />
              <span>Mobile</span>
            </button>
          </div>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              alert(`Lien public copié : https://${storeConfig.slug}.mercatoboutique.com`)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-sm hover:brightness-105 transition-all"
          >
            <ExternalLink size={14} />
            <span>Partager le lien</span>
          </a>
        </div>
      </div>

      {/* Simulator Device Frame */}
      <div className="flex justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            deviceMode === 'mobile'
              ? 'max-w-md rounded-[44px] border-[10px] border-stone-900 shadow-2xl overflow-hidden bg-stone-900'
              : 'rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden'
          }`}
        >
          <div className="bg-white min-h-[780px] flex flex-col font-sans text-stone-800 relative">
            {/* Top Marquee Announcement */}
            <div className="bg-gradient-to-r from-[#171717] via-stone-800 to-[#171717] text-[#FFD43B] px-4 py-2 text-[11px] font-extrabold flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2 animate-pulse">
                <Flame size={14} className="text-orange-400 fill-orange-400" />
                <span>SUPER DEALS MERCATO : Jusqu'à -50% + Expédition Express 24h</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-stone-300 text-[10px]">
                <span>🛡️ Trade Assurance 100%</span>
                <span>•</span>
                <span>⭐ Fournisseur Vérifié Or</span>
              </div>
            </div>

            {/* Main Client Storefront Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-100 px-4 sm:px-6 py-3 space-y-2.5">
              <div className="flex items-center justify-between gap-4">
                {/* Logo & Store Branding */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-lg flex items-center justify-center shadow-md shadow-[#FFD43B]/30 shrink-0">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm text-[#171717] tracking-tight">
                        {storeConfig.name}
                      </h3>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-0.5">
                        <Star size={9} className="fill-amber-500 text-amber-500" />
                        {storeConfig.rating || 4.9}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {storeConfig.city || 'Abidjan'} • Réponse en {storeConfig.responseRate || '< 15 min'}
                    </p>
                  </div>
                </div>

                {/* Search Bar with quick filters */}
                <div className="hidden md:flex flex-1 max-w-md mx-2 relative">
                  <input
                    type="text"
                    placeholder="Chercher des articles, lots en gros, références..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-semibold text-[#171717] outline-none focus:bg-white focus:border-[#FFD43B]"
                  />
                  <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClaimCoupon('MERCATO5K', 5000)}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      claimedCoupons.includes('MERCATO5K')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-[#FFF4BF] text-[#171717] border-[#FFD43B] hover:scale-105'
                    }`}
                  >
                    <Gift size={13} className="text-amber-600" />
                    <span>{claimedCoupons.includes('MERCATO5K') ? 'Coupon -5 000 F Actif' : 'Réclamer -5 000 F'}</span>
                  </button>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2.5 rounded-2xl bg-[#171717] text-white hover:brightness-125 transition-all shadow-md"
                  >
                    <ShoppingBag size={18} />
                    {totalCartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#FFD43B] text-[#171717] font-black text-[10px] shadow-sm animate-bounce">
                        {totalCartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Search input */}
              <div className="flex md:hidden relative">
                <input
                  type="text"
                  placeholder="Rechercher sur la boutique..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-semibold text-[#171717] outline-none"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
              </div>
            </header>

            {/* Quick Filter Tabs: Super Deals, Choice, Wholesale */}
            <div className="px-4 sm:px-6 py-2.5 bg-[#FBFBFA] border-b border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedTab === 'all'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                Tous les articles ({storeProducts.length})
              </button>

              <button
                onClick={() => setSelectedTab('flash')}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedTab === 'flash'
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60'
                }`}
              >
                <Flame size={13} className="fill-current animate-pulse" />
                <span>🔥 Ventes Flash</span>
              </button>

              <button
                onClick={() => setSelectedTab('choice')}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedTab === 'choice'
                    ? 'bg-amber-400 text-[#171717] shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                }`}
              >
                <Sparkles size={13} />
                <span>💎 Sélection Choice</span>
              </button>

              <button
                onClick={() => setSelectedTab('wholesale')}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedTab === 'wholesale'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                <Layers size={13} />
                <span>📦 Paliers de Gros</span>
              </button>

              <button
                onClick={() => setSelectedTab('top')}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedTab === 'top'
                    ? 'bg-stone-800 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                <TrendingUp size={13} />
                <span>⭐ Meilleures Ventes</span>
              </button>
            </div>

            {/* Flash Deals Hero Banner with Golden Stage Podium & Ribbons (Inspired by Reference Images) */}
            <div className="relative bg-[#0A0A0D] text-white px-4 sm:px-8 py-8 overflow-hidden min-h-[220px] flex items-center justify-between">
              {/* Scenographic Golden Stage Background */}
              <GoldenStageBackground showPodium={true} showParticles={true} intensity="subtle" className="opacity-90" />

              <div className="relative z-10 max-w-xl space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm animate-pulse">
                    <Flame size={12} className="fill-white" /> VENTE ÉCLAIR EXCLUSIVE
                  </span>
                  
                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFD43B] bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-[#FFD43B]/30 shadow-sm">
                    <Clock size={13} />
                    <span>Fin dans :</span>
                    <span className="bg-[#FFD43B] text-[#0C0C0E] px-1.5 py-0.5 rounded text-[11px] font-black">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-[#FFD43B] text-[#0C0C0E] px-1.5 py-0.5 rounded text-[11px] font-black">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-[#FFD43B] text-[#0C0C0E] px-1.5 py-0.5 rounded text-[11px] font-black">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {storeConfig.slogan || storeConfig.tagline}
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
                  Profitez de prix usine directs, de remises dégressives par quantité et de la livraison express partout à Abidjan et dans la sous-région UEMOA.
                </p>
              </div>
            </div>

            {/* Category Pills Bar */}
            <div className="px-4 sm:px-6 py-3 border-b border-stone-100 flex gap-2 overflow-x-auto no-scrollbar bg-[#F6F6F3]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                  }`}
                >
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </button>
              ))}
            </div>

            {/* Live Buyer Floating Toast */}
            <AnimatePresence>
              {recentBuyerToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute bottom-20 left-4 z-20 bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xl rounded-2xl p-2.5 flex items-center gap-2.5 max-w-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFF4BF] text-[#171717] flex items-center justify-center font-bold text-xs shrink-0">
                    🛍️
                  </div>
                  <div className="text-[11px] leading-tight min-w-0">
                    <p className="font-extrabold text-[#171717] truncate">
                      {recentBuyerToast.name} à {recentBuyerToast.city}
                    </p>
                    <p className="text-stone-500 truncate text-[10px]">
                      A commandé : {recentBuyerToast.item}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Products Grid */}
            <div className="p-4 sm:p-6 flex-1 bg-[#F6F6F3]">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-stone-200 text-stone-500 flex items-center justify-center mx-auto text-2xl">
                    🔍
                  </div>
                  <h3 className="font-extrabold text-sm text-[#171717]">
                    Aucun article ne correspond à cette sélection
                  </h3>
                  <p className="text-xs text-stone-500">
                    Essayez de réinitialiser vos filtres ou effectuez une recherche différente.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTab('all')
                      setSelectedCategory('all')
                      setSearchQuery('')
                    }}
                    className="px-4 py-2 rounded-2xl bg-[#171717] text-white font-bold text-xs"
                  >
                    Voir tout le catalogue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((prod) => {
                    const discountPercent = prod.originalPrice
                      ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                      : null
                    const isLiked = likedProductIds.includes(prod.id)

                    return (
                      <motion.div
                        key={prod.id}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-xl transition-all flex flex-col justify-between group relative"
                      >
                        {/* Badges Overlay */}
                        <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => handleOpenQuickView(prod)}>
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Discount tag */}
                          {discountPercent && (
                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-red-600 text-white font-black text-[10px] shadow-sm flex items-center gap-0.5">
                              <span>-{discountPercent}%</span>
                            </div>
                          )}

                          {/* Choice / Wholesale Tag */}
                          {prod.isChoice && (
                            <div className="absolute top-2.5 right-10 px-2 py-0.5 rounded-lg bg-[#FFD43B] text-[#171717] font-black text-[9px] shadow-sm">
                              CHOICE
                            </div>
                          )}

                          {/* Like Wishlist button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleLike(prod.id)
                            }}
                            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${
                              isLiked
                                ? 'bg-red-50 text-red-600'
                                : 'bg-white/90 text-stone-600 hover:text-red-600'
                            }`}
                          >
                            <Heart size={13} className={isLiked ? 'fill-red-600' : ''} />
                          </button>

                          {/* Quick View trigger on hover */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 rounded-xl bg-white/95 text-[#171717] font-black text-xs shadow-lg flex items-center gap-1.5 scale-95 group-hover:scale-100 transition-transform">
                              <Eye size={13} /> Aperçu Rapide
                            </span>
                          </div>
                        </div>

                        {/* Card Content & Wholesale Pricing */}
                        <div className="p-4 space-y-2.5">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase">
                              <span>{prod.category}</span>
                              {prod.moq && prod.moq > 1 && (
                                <span className="text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-extrabold">
                                  MOQ: {prod.moq} pcs
                                </span>
                              )}
                            </div>
                            <h4
                              onClick={() => handleOpenQuickView(prod)}
                              className="font-extrabold text-xs text-[#171717] mt-0.5 line-clamp-2 cursor-pointer hover:text-amber-600 transition-colors"
                            >
                              {prod.name}
                            </h4>
                          </div>

                          {/* Pricing & Discounts */}
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-black text-[#171717]">
                                {formatCurrency(prod.price)}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-xs text-stone-400 line-through">
                                  {formatCurrency(prod.originalPrice)}
                                </span>
                              )}
                            </div>

                            {/* Wholesale Tier Pricing Snippet */}
                            {prod.wholesaleTiers && prod.wholesaleTiers.length > 1 && (
                              <div className="mt-1.5 p-1.5 rounded-xl bg-[#F6F6F3] border border-stone-200/50 text-[10px] space-y-0.5">
                                <div className="text-stone-500 font-bold flex items-center justify-between">
                                  <span>Paliers de gros :</span>
                                  <span className="text-emerald-700 font-black">
                                    Jusqu’à -{prod.wholesaleTiers[prod.wholesaleTiers.length - 1].discountPercent}%
                                  </span>
                                </div>
                                <p className="text-stone-700 font-medium">
                                  {prod.wholesaleTiers[1].minQty}+ pcs :{' '}
                                  <strong className="text-[#171717]">
                                    {formatCurrency(prod.wholesaleTiers[1].unitPrice)}
                                  </strong>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Ratings, Sold count & Shipping badge */}
                          <div className="space-y-1 pt-1 border-t border-stone-100 text-[10px] text-stone-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 font-bold text-[#171717]">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span>{prod.rating}</span>
                                <span className="text-stone-400">({prod.reviewCount || 340})</span>
                              </div>
                              <span className="font-semibold text-stone-600">
                                {prod.salesCount}+ vendus
                              </span>
                            </div>

                            {prod.shippingBadge && (
                              <p className="text-emerald-700 font-bold flex items-center gap-1 truncate text-[10px]">
                                <Truck size={11} className="shrink-0" />
                                <span className="truncate">{prod.shippingBadge}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Add To Cart & Wholesale Inquiry Action */}
                        <div className="p-4 pt-0">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddToCart(prod, prod.moq || 1)}
                            className="w-full py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-xs hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag size={14} />
                            <span>Ajouter au panier</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Storefront Trust Badges & Guarantee Footer */}
            <footer className="p-6 bg-white border-t border-stone-200 space-y-4 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700 font-bold">
                <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F6F6F3]">
                  <Truck size={18} className="text-amber-600 shrink-0" />
                  <div className="text-left text-[11px]">
                    <p className="font-extrabold text-[#171717]">Livraison Express & Suivi</p>
                    <p className="text-stone-400">Brazzaville, Pointe-Noire et intérieur du Congo</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F6F6F3]">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <div className="text-left text-[11px]">
                    <p className="font-extrabold text-[#171717]">Trade Assurance CEMAC 100%</p>
                    <p className="text-stone-400">Paiement MTN MoMo & Airtel Money</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F6F6F3]">
                  <MessageSquare size={18} className="text-[#171717] shrink-0" />
                  <div className="text-left text-[11px]">
                    <p className="font-extrabold text-[#171717]">Support Vendeur Direct</p>
                    <p className="text-stone-400">WhatsApp réponse instantanée</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-stone-400">
                Boutique officielle propulsée par <strong>Mercato SaaS Platform Congo</strong> • Tous droits réservés 2026.
              </p>
            </footer>

            {/* Quick View Modal with 3D Gallery & Wholesale Calculator */}
            <AnimatePresence>
              {quickViewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
                  >
                    {/* Modal Header */}
                    <div className="p-4 px-6 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFD43B] text-[#171717] uppercase">
                          Détails Produit & Paliers
                        </span>
                        {quickViewProduct.isWholesale && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Paliers de Gros B2B
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setQuickViewProduct(null)}
                        className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Gallery */}
                        <div className="space-y-3">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80">
                            <img
                              src={quickViewProduct.images[selectedImgIndex] || quickViewProduct.images[0]}
                              alt={quickViewProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {quickViewProduct.images.length > 1 && (
                            <div className="flex gap-2">
                              {quickViewProduct.images.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImgIndex(idx)}
                                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                                    selectedImgIndex === idx
                                      ? 'border-[#FFD43B] ring-2 ring-[#FFD43B]/40'
                                      : 'border-stone-200 opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Details & Live Tier Pricing Calculator */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-stone-400">
                              {quickViewProduct.category} • SKU: {quickViewProduct.sku}
                            </span>
                            <h3 className="text-base font-black text-[#171717] mt-1">
                              {quickViewProduct.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex items-center gap-1 font-extrabold text-xs text-[#171717]">
                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                <span>{quickViewProduct.rating}</span>
                              </div>
                              <span className="text-xs text-stone-400">
                                • {quickViewProduct.salesCount} vendus
                              </span>
                            </div>
                          </div>

                          {/* Wholesale Tier Pricing Table */}
                          {quickViewProduct.wholesaleTiers && quickViewProduct.wholesaleTiers.length > 0 && (
                            <div className="p-3.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 space-y-2">
                              <p className="text-[11px] font-extrabold text-[#171717] uppercase tracking-wider">
                                Grille tarifaire par volume (Prix Dégressifs) :
                              </p>
                              <div className="grid grid-cols-3 gap-1.5 text-center">
                                {quickViewProduct.wholesaleTiers.map((tier, i) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded-xl border text-xs ${
                                      quickViewQuantity >= tier.minQty && (!tier.maxQty || quickViewQuantity <= tier.maxQty)
                                        ? 'bg-[#FFF4BF] border-[#FFD43B] font-black'
                                        : 'bg-white border-stone-200 font-medium text-stone-600'
                                    }`}
                                  >
                                    <p className="text-[10px] text-stone-500">
                                      {tier.minQty} {tier.maxQty ? `- ${tier.maxQty}` : '+'} pcs
                                    </p>
                                    <p className="font-black text-[#171717] mt-0.5">
                                      {formatCurrency(tier.unitPrice)}
                                    </p>
                                    {tier.discountPercent > 0 && (
                                      <span className="text-[9px] font-bold text-emerald-600">
                                        -{tier.discountPercent}%
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dynamic Quantity Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                              <span>Quantité souhaitée :</span>
                              <span className="text-stone-500 font-normal text-[11px]">
                                Prix unitaire calculé :{' '}
                                <strong className="text-[#171717]">
                                  {formatCurrency(getTieredPrice(quickViewProduct, quickViewQuantity))}
                                </strong>
                              </span>
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-[#F6F6F3] border border-stone-200 rounded-2xl p-1">
                                <button
                                  onClick={() =>
                                    setQuickViewQuantity(Math.max(quickViewProduct.moq || 1, quickViewQuantity - 1))
                                  }
                                  className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center font-bold shadow-2xs hover:bg-stone-100"
                                >
                                  <Minus size={13} />
                                </button>
                                <input
                                  type="number"
                                  min={quickViewProduct.moq || 1}
                                  value={quickViewQuantity}
                                  onChange={(e) =>
                                    setQuickViewQuantity(Math.max(quickViewProduct.moq || 1, Number(e.target.value) || 1))
                                  }
                                  className="w-14 text-center font-black text-xs bg-transparent outline-none"
                                />
                                <button
                                  onClick={() => setQuickViewQuantity(quickViewQuantity + 1)}
                                  className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center font-bold shadow-2xs hover:bg-stone-100"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <div className="flex-1 text-right">
                                <p className="text-[10px] text-stone-400 uppercase font-bold">Total estimé</p>
                                <p className="text-lg font-black text-[#171717]">
                                  {formatCurrency(getTieredPrice(quickViewProduct, quickViewQuantity) * quickViewQuantity)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* WhatsApp Direct Negotiation Button */}
                          <a
                            href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(
                              `Bonjour, je souhaite commander ${quickViewQuantity}x ${quickViewProduct.name} (${formatCurrency(
                                getTieredPrice(quickViewProduct, quickViewQuantity) * quickViewQuantity
                              )}). Pouvez-vous confirmer la disponibilité ?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-sm hover:bg-emerald-700 transition-all"
                          >
                            <MessageSquare size={14} />
                            <span>Discuter / Négocier sur WhatsApp</span>
                          </a>

                          {/* Add to Cart in modal */}
                          <button
                            onClick={() => {
                              handleAddToCart(quickViewProduct, quickViewQuantity)
                              setQuickViewProduct(null)
                            }}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-md hover:brightness-105 transition-all"
                          >
                            <ShoppingBag size={15} />
                            <span>
                              Ajouter {quickViewQuantity} article(s) au panier (
                              {formatCurrency(getTieredPrice(quickViewProduct, quickViewQuantity) * quickViewQuantity)})
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Product Description & Specifications */}
                      <div className="pt-4 border-t border-stone-100 space-y-2">
                        <h4 className="text-xs font-black text-[#171717]">Description & Spécifications</h4>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {quickViewProduct.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Slide-out Cart & Live Checkout Drawer */}
            <AnimatePresence>
              {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                  >
                    {/* Cart Header */}
                    <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-[#171717]" />
                        <h3 className="font-extrabold text-sm text-[#171717]">
                          Mon Panier ({totalCartCount})
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="p-5 flex-1 overflow-y-auto space-y-3">
                      {cart.length === 0 ? (
                        <div className="py-20 text-center space-y-3">
                          <p className="text-3xl">🛒</p>
                          <h4 className="font-extrabold text-sm text-[#171717]">Votre panier est vide</h4>
                          <p className="text-xs text-stone-500">
                            Ajoutez des articles depuis le catalogue pour passer commande.
                          </p>
                        </div>
                      ) : (
                        cart.map(({ product, quantity }) => {
                          const unitPrice = getTieredPrice(product, quantity)
                          return (
                            <div
                              key={product.id}
                              className="p-3 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 flex items-center gap-3"
                            >
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-extrabold text-xs text-[#171717] truncate">
                                  {product.name}
                                </h5>
                                <p className="text-xs font-black text-[#171717] mt-0.5">
                                  {formatCurrency(unitPrice * quantity)}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  {formatCurrency(unitPrice)} / unité
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1 shrink-0">
                                <button
                                  onClick={() => {
                                    if (quantity <= 1) {
                                      setCart(cart.filter((item) => item.product.id !== product.id))
                                    } else {
                                      setCart(
                                        cart.map((item) =>
                                          item.product.id === product.id
                                            ? { ...item, quantity: item.quantity - 1 }
                                            : item
                                        )
                                      )
                                    }
                                  }}
                                  className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-xs">{quantity}</span>
                                <button
                                  onClick={() =>
                                    setCart(
                                      cart.map((item) =>
                                        item.product.id === product.id
                                          ? { ...item, quantity: item.quantity + 1 }
                                          : item
                                      )
                                    )
                                  }
                                  className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Cart Footer & Checkout */}
                    {cart.length > 0 && (
                      <div className="p-5 border-t border-stone-200 bg-[#FBFBFA] space-y-3">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-stone-500">
                            <span>Sous-total articles :</span>
                            <span className="font-bold text-[#171717]">{formatCurrency(cartSubtotal)}</span>
                          </div>
                          {activeDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                              <span>Coupon de réduction :</span>
                              <span>-{formatCurrency(activeDiscount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-500">
                            <span>Frais de livraison :</span>
                            <span className="font-bold text-[#171717]">
                              {cartSubtotal > storeConfig.freeDeliveryThreshold
                                ? 'Gratuit (Offert)'
                                : formatCurrency(storeConfig.deliveryFee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-[#171717] pt-2 border-t border-stone-200">
                            <span>Total à payer :</span>
                            <span className="text-base text-[#171717]">{formatCurrency(finalCartTotal)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            alert(
                              `🎉 Commande validée pour un montant de ${formatCurrency(
                                finalCartTotal
                              )} ! Redirection vers le paiement Mobile Money (MTN MoMo / Airtel Money Congo).`
                            )
                            setCart([])
                            setIsCartOpen(false)
                          }}
                          className="w-full py-3.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-lg shadow-[#FFD43B]/40 hover:brightness-105 transition-all flex items-center justify-center gap-2"
                        >
                          <span>Paiement Sécurisé (MTN MoMo / Airtel / Carte)</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
