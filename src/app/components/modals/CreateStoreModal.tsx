import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Store,
  Layers,
  CheckCircle2,
  ArrowRight,
  Package,
  TrendingUp,
  Palette,
  ShieldCheck,
  Globe,
} from 'lucide-react'
import { StoreConfig } from '../../types'
import confetti from 'canvas-confetti'

interface CreateStoreModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateStore: (newStore: StoreConfig, initialTemplate: string) => void
}

const STORE_TEMPLATES = [
  {
    id: 'fashion',
    type: 'fashion' as const,
    label: 'Mode & Maroquinerie',
    icon: '👜',
    desc: 'Vêtements, sacs en cuir, souliers et accessoires de luxe',
    defaultTheme: 'mercato_yellow' as const,
    accentColor: '#FFD43B',
    slogan: 'L’élégance africaine contemporaine',
    catalogItemsCount: 8,
  },
  {
    id: 'electronics',
    type: 'electronics' as const,
    label: 'Tech, Gadgets & Mobile',
    icon: '⚡',
    desc: 'Smartphones, écouteurs sans fil, accessoires et objets connectés',
    defaultTheme: 'indigo' as const,
    accentColor: '#4F46E5',
    slogan: 'L’innovation High-Tech au meilleur prix',
    catalogItemsCount: 10,
  },
  {
    id: 'wholesale',
    type: 'wholesale' as const,
    label: 'Grossiste B2B & Quincaillerie Industrielle',
    icon: '📦',
    desc: 'Vente par lots, matériaux, outils et fournitures industrielles',
    defaultTheme: 'obsidian' as const,
    accentColor: '#171717',
    slogan: 'Achat direct usine & prix dégressifs par volume',
    catalogItemsCount: 12,
  },
  {
    id: 'cosmetics',
    type: 'cosmetics' as const,
    label: 'Cosmétiques & Soins Bio',
    icon: '🌿',
    desc: 'Soins botaniques, karité bio, sérums et parfumerie artisanale',
    defaultTheme: 'emerald' as const,
    accentColor: '#10B981',
    slogan: 'La pureté naturelle au service de votre beauté',
    catalogItemsCount: 6,
  },
  {
    id: 'food',
    type: 'food' as const,
    label: 'Épicerie Fine & Terroir',
    icon: '☕',
    desc: 'Cafés d’exception, chocolats fins, épices rares et thés',
    defaultTheme: 'coral' as const,
    accentColor: '#F97316',
    slogan: 'Saveurs authentiques et délices d’origine',
    catalogItemsCount: 6,
  },
]

export function CreateStoreModal({
  isOpen,
  onClose,
  onCreateStore,
}: CreateStoreModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(STORE_TEMPLATES[0])
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [city, setCity] = useState('Abidjan, Côte d’Ivoire')
  const [phone, setPhone] = useState('+225 07 00 11 22 33')
  const [currency, setCurrency] = useState('FCFA')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleNameChange = (val: string) => {
    setStoreName(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generatedSlug || 'ma-boutique')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const finalName = storeName.trim() || `Boutique ${selectedTemplate.label}`
    const finalSlug = slug || 'nouvelle-boutique-' + Date.now().toString().slice(-4)

    const newStore: StoreConfig = {
      id: `store-${Date.now()}`,
      name: finalName,
      type: selectedTemplate.type,
      typeLabel: selectedTemplate.label,
      tagline: selectedTemplate.slogan,
      slogan: selectedTemplate.slogan,
      description: `Boutique officielle ${finalName}, spécialiste ${selectedTemplate.label}.`,
      slug: finalSlug,
      currency,
      currencySymbol: currency,
      accentColor: selectedTemplate.accentColor,
      announcement: `✨ Bienvenue chez ${finalName} ! Profitez de nos offres de lancement.`,
      whatsappNumber: phone.replace(/[^0-9+]/g, ''),
      phone,
      email: `contact@${finalSlug}.mercatoboutique.com`,
      address: 'Plateau / Cocody, Abidjan',
      city,
      deliveryFee: 1500,
      freeDeliveryThreshold: 45000,
      theme: selectedTemplate.defaultTheme,
      rating: 4.9,
      positiveReviewsPercent: 99,
      responseRate: '< 15 min',
    }

    setTimeout(() => {
      onCreateStore(newStore, selectedTemplate.id)
      setIsSubmitting(false)
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD43B', '#171717', '#10B981', '#4F46E5'],
        })
      } catch (err) {}
      onClose()
    }, 450)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#FFF4BF]/80 via-white to-stone-50 border-b border-stone-100 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 flex items-center justify-center shadow-2xs transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD43B] text-[#171717] flex items-center justify-center shadow-md shadow-[#FFD43B]/30 font-black text-xl">
                <Store size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#171717] text-white uppercase tracking-wider">
                  Mercato Multi-Store SaaS
                </span>
                <h2 className="text-xl font-extrabold text-[#171717] mt-0.5">
                  Créer une nouvelle boutique
                </h2>
                <p className="text-xs text-stone-500">
                  Lancez un commerce de n’importe quel type en quelques clics avec catalogue pré-configuré.
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Step 1: Industry / Sector selector */}
            <div>
              <label className="block text-xs font-extrabold text-[#171717] uppercase tracking-wider mb-2">
                1. Choisissez le type de commerce / secteur
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STORE_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id
                  return (
                    <motion.div
                      key={tmpl.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#FFF4BF]/30 border-[#FFD43B] ring-2 ring-[#FFD43B]/40 shadow-xs'
                          : 'bg-[#FBFBFA] border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-2xl shrink-0 p-2 rounded-xl bg-white shadow-2xs">
                        {tmpl.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-[#171717] truncate">
                            {tmpl.label}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 size={14} className="text-[#171717] shrink-0 fill-[#FFD43B]" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {tmpl.desc}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Store Identity */}
            <div className="space-y-4">
              <label className="block text-xs font-extrabold text-[#171717] uppercase tracking-wider">
                2. Identité de votre boutique
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom commercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`ex: ${selectedTemplate.label} Direct`}
                    value={storeName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Devise principale
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B]"
                  >
                    <option value="FCFA">FCFA (Franc CFA - XOF)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="USD">USD ($ Dollar US)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Adresse URL publique (Sous-domaine)
                </label>
                <div className="flex items-center px-3.5 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs">
                  <Globe size={14} className="text-stone-400 mr-2 shrink-0" />
                  <span className="text-stone-500">https://</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent font-extrabold text-[#171717] outline-none px-1 flex-1 min-w-0"
                    placeholder="ma-boutique"
                  />
                  <span className="text-stone-400 font-bold">.mercatoboutique.com</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Numéro WhatsApp Commercial
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ville / Siège
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B]"
                  />
                </div>
              </div>
            </div>

            {/* Template Features Preview */}
            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Package size={18} className="text-amber-500" />
                <div>
                  <p className="font-extrabold text-[#171717]">
                    Pack de démarrage inclus
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Génère automatiquement {selectedTemplate.catalogItemsCount} articles types avec paliers de prix et photos HD.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Auto-rempli
              </span>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all"
              >
                Annuler
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-lg shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
              >
                {isSubmitting ? (
                  <span>Génération de la boutique...</span>
                ) : (
                  <>
                    <Store size={15} />
                    <span>Lancer la boutique instantanément</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
