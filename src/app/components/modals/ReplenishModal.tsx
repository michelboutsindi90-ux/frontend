import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Boxes, Truck, Check, AlertTriangle, Plus, Minus } from 'lucide-react'
import { Product } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import confetti from 'canvas-confetti'

interface ReplenishModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onConfirmReplenish: (productId: string, quantityToAdd: number) => void
}

export function ReplenishModal({
  product,
  isOpen,
  onClose,
  onConfirmReplenish,
}: ReplenishModalProps) {
  if (!isOpen || !product) return null

  const [quantity, setQuantity] = useState<number>(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalCost = quantity * product.costPrice

  const handleConfirm = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      onConfirmReplenish(product.id, quantity)
      setIsSubmitting(false)
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                <Boxes size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">
                  Réapprovisionner le stock
                </h3>
                <p className="text-xs text-stone-500">Bon de commande fournisseur direct</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6F6F3]">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#171717] truncate">{product.name}</p>
                <p className="text-[11px] text-stone-500">
                  Stock actuel : <strong>{product.stock}</strong> • Seuil : {product.alertThreshold}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {product.supplier}
                </span>
              </div>
            </div>

            {/* Stepper Quantity */}
            <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 text-center space-y-3">
              <p className="text-xs font-bold text-stone-700">Quantité à commander</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(5, quantity - 5))}
                  className="w-10 h-10 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-lg font-bold text-stone-700"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-24 text-center font-black text-2xl text-[#171717] bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 5)}
                  className="w-10 h-10 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-lg font-bold text-stone-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick suggestion buttons */}
              <div className="flex justify-center gap-2 pt-2">
                {[10, 25, 50, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-600 hover:bg-[#FFD43B] hover:text-[#171717] transition-colors"
                  >
                    +{q}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial estimate */}
            <div className="p-4 rounded-2xl bg-[#FFF4BF]/50 border border-[#FFD43B]/40 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-700">
                <span>Coût unitaire fournisseur :</span>
                <span className="font-bold">{formatCurrency(product.costPrice)}</span>
              </div>
              <div className="flex justify-between text-[#171717] font-black text-sm pt-1 border-t border-[#FFD43B]/40">
                <span>Coût total de réassort :</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-extrabold text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105"
              >
                {isSubmitting ? (
                  <span>Validation...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirmer et réapprovisionner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
