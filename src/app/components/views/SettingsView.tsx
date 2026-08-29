import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Save,
  Check,
  Smartphone,
  Globe,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react'
import { StoreConfig } from '../../types'
import confetti from 'canvas-confetti'

interface SettingsViewProps {
  storeConfig: StoreConfig
  onUpdateStoreConfig: (config: StoreConfig) => void
}

export function SettingsView({
  storeConfig,
  onUpdateStoreConfig,
}: SettingsViewProps) {
  const [name, setName] = useState(storeConfig.name)
  const [slogan, setSlogan] = useState(storeConfig.slogan)
  const [description, setDescription] = useState(storeConfig.description)
  const [phone, setPhone] = useState(storeConfig.phone)
  const [currency, setCurrency] = useState(storeConfig.currency)
  const [waveEnabled, setWaveEnabled] = useState(true)
  const [omEnabled, setOmEnabled] = useState(true)
  const [cardEnabled, setCardEnabled] = useState(true)
  const [cashEnabled, setCashEnabled] = useState(true)
  const [shippingFeeAbidjan, setShippingFeeAbidjan] = useState(1500)
  const [shippingFeeNational, setShippingFeeNational] = useState(3500)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateStoreConfig({
      ...storeConfig,
      name,
      slogan,
      description,
      phone,
      currency,
    })
    setIsSaved(true)
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FFD43B', '#171717'],
      })
    } catch (e) {}
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div id="settings-view" className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
          Paramètres de la Boutique
        </h1>
        <p className="text-xs text-[#777777] mt-0.5">
          Personnalisez l'identité de votre enseigne, vos passerelles de paiement et vos frais de livraison.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Identity */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4BF] text-[#171717] flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#171717]">Identité Commerciale</h2>
              <p className="text-xs text-stone-500">Nom, contact public et devise d'affichage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Nom de la boutique *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Devise principale
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none"
              >
                <option value="FCFA">FCFA (Franc CFA - XOF)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="USD">USD ($ Dollar US)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Slogan / Accroche
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Description de la boutique
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Numéro WhatsApp Boutique
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Lien domaine / sous-domaine
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-2xl bg-[#F6F6F3] text-xs font-bold text-stone-600">
                <span>{storeConfig.slug}.mercatoboutique.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Payment Gateways */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4BF] text-[#171717] flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#171717]">Moyens de Paiement Acceptés</h2>
              <p className="text-xs text-stone-500">Mobile Money direct et cartes bancaires</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-xs text-[#171717]">Wave Mobile Money</p>
                <p className="text-[11px] text-stone-400">QR Code et virement sans frais</p>
              </div>
              <input
                type="checkbox"
                checked={waveEnabled}
                onChange={(e) => setWaveEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#171717] rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-xs text-[#171717]">Orange Money / MTN</p>
                <p className="text-[11px] text-stone-400">Paiement USSD et API</p>
              </div>
              <input
                type="checkbox"
                checked={omEnabled}
                onChange={(e) => setOmEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#171717] rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-xs text-[#171717]">Cartes Visa & Mastercard</p>
                <p className="text-[11px] text-stone-400">Paiement international 3D-Secure</p>
              </div>
              <input
                type="checkbox"
                checked={cardEnabled}
                onChange={(e) => setCardEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#171717] rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-xs text-[#171717]">Paiement à la livraison (Cash)</p>
                <p className="text-[11px] text-stone-400">Règlement en espèces au coursier</p>
              </div>
              <input
                type="checkbox"
                checked={cashEnabled}
                onChange={(e) => setCashEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#171717] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Zones & Fees */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4BF] text-[#171717] flex items-center justify-center">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#171717]">Zones de Livraison & Tarifs</h2>
              <p className="text-xs text-stone-500">Fixez les frais d'expédition appliqués au panier</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Livraison Abidjan Urbain (FCFA)
              </label>
              <input
                type="number"
                value={shippingFeeAbidjan}
                onChange={(e) => setShippingFeeAbidjan(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Expédition Intérieur du pays (FCFA)
              </label>
              <input
                type="number"
                value={shippingFeeNational}
                onChange={(e) => setShippingFeeNational(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Modifications enregistrées avec succès !
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-lg shadow-[#FFD43B]/40 hover:brightness-105 transition-all"
          >
            <Save size={16} />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  )
}
