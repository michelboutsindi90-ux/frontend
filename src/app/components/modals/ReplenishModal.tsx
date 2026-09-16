import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Boxes, Check, Plus, Minus } from 'lucide-react'
import { ProductWithStock, StockMovementType } from '../../types'
import * as stockClient from '../../lib/resources/stock'
import { ApiError } from '../../lib/apiClient'

interface ReplenishModalProps {
  product: ProductWithStock | null
  isOpen: boolean
  onClose: () => void
  shopId: string
  onAdjusted: () => void
}

const typeLabels: { id: StockMovementType; label: string }[] = [
  { id: 'RESTOCK', label: 'Réassort' },
  { id: 'RETURN', label: 'Retour' },
  { id: 'ADJUSTMENT', label: 'Correction' },
]

export function ReplenishModal({ product, isOpen, onClose, shopId, onAdjusted }: ReplenishModalProps) {
  const [type, setType] = useState<StockMovementType>('RESTOCK')
  const [quantity, setQuantity] = useState<number>(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !product) return null

  const currentQuantity = product.stock?.quantity ?? 0
  const isSignedAllowed = type === 'ADJUSTMENT'

  const handleConfirm = async () => {
    if (quantity === 0) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const signedQuantity = isSignedAllowed ? quantity : Math.abs(quantity)
      await stockClient.adjustStock(shopId, product.id, { type, quantity: signedQuantity })
      onAdjusted()
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible d’ajuster le stock.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white mt-auto sm:my-auto rounded-t-3xl sm:rounded-3xl max-h-[92dvh] sm:max-h-none overflow-y-auto sm:overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0 shadow-2xl border border-stone-200"
        >
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-100 flex items-center justify-between gap-3 bg-[#FBFBFA]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                <Boxes size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">Ajuster le stock</h3>
                <p className="text-xs text-stone-500 truncate">{product.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-[#F6F6F3] flex items-center justify-between">
              <span className="text-xs text-stone-600">Stock actuel</span>
              <span className="text-sm font-black text-[#171717]">{currentQuantity} unités</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {typeLabels.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    type === t.id ? 'bg-[#FFD43B] text-[#171717] border-[#FFD43B]' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 text-center space-y-3">
              <p className="text-xs font-bold text-stone-700">
                {isSignedAllowed ? 'Delta (positif ou négatif)' : 'Quantité'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(quantity - 1)}
                  className="w-11 h-11 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-20 sm:w-24 min-w-0 text-center font-black text-2xl text-[#171717] bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100">
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting || quantity === 0}
                onClick={handleConfirm}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-extrabold text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 disabled:opacity-60"
              >
                {isSubmitting ? <span>Validation...</span> : (<><Check size={16} /><span>Confirmer</span></>)}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
