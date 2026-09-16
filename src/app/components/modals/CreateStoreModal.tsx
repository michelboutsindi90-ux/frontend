import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Store, CheckCircle2, ArrowRight, MapPin } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { ApiError } from '../../lib/apiClient'

interface CreateStoreModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateStoreModal({ isOpen, onClose }: CreateStoreModalProps) {
  const { createShop } = useShop()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await createShop({ name: name.trim(), address: address.trim() || undefined })
      setName('')
      setAddress('')
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible de créer la boutique.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white mt-auto sm:my-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] pb-[env(safe-area-inset-bottom)] sm:pb-0"
        >
          <div className="p-5 sm:p-6 pr-14 bg-gradient-to-r from-[#FFF4BF]/80 via-white to-stone-50 border-b border-stone-100 relative shrink-0">
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
                <h2 className="text-lg sm:text-xl font-extrabold text-[#171717] mt-0.5">Créer une nouvelle boutique</h2>
                <p className="text-xs text-stone-500">Renseignez son nom et son adresse.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nom commercial *</label>
              <input
                type="text"
                required
                placeholder="ex: Boutique Sape & Élégance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Adresse</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Plateau des 15ans"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>
            </div>

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
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-lg shadow-[#FFD43B]/30 hover:brightness-105 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Création en cours...</span>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Créer la boutique</span>
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
