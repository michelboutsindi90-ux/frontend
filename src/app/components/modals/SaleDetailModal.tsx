import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ShoppingBag, Check, Ban, Undo2 } from 'lucide-react'
import { Product, Sale } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'
import * as salesClient from '../../lib/resources/sales'
import { ApiError } from '../../lib/apiClient'

interface SaleDetailModalProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
  shopId: string
  products: Product[]
  canManage: boolean
  onChanged: () => void
}

export function SaleDetailModal({ sale, isOpen, onClose, shopId, products, canManage, onChanged }: SaleDetailModalProps) {
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !sale) return null

  const badge = getStatusBadge(sale.status)

  const runAction = async (action: () => Promise<Sale>) => {
    setIsBusy(true)
    setErrorMessage(null)
    try {
      await action()
      onChanged()
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Action impossible.")
    } finally {
      setIsBusy(false)
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
          className="w-full max-w-2xl bg-white mt-auto sm:my-auto rounded-t-3xl sm:rounded-3xl max-h-[92dvh] sm:max-h-none overflow-y-auto sm:overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0 shadow-2xl border border-stone-200"
        >
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-100 flex items-center justify-between gap-3 bg-[#FBFBFA]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                <ShoppingBag size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#171717] font-mono">Vente {sale.id.slice(0, 8)}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-[#777777] mt-0.5">{new Date(sale.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{errorMessage}</div>
            )}

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/80 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Articles vendus ({sale.lines?.length ?? 0})
              </h3>
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {(sale.lines ?? []).map((line) => {
                  const product = products.find((p) => p.id === line.productId)
                  return (
                    <div key={line.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#171717] truncate">{product?.name || 'Produit supprimé'}</p>
                        <p className="text-[11px] text-stone-500">
                          Quantité : <strong>{line.quantity}</strong> × {formatCurrency(line.unitPrice)}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[#171717] whitespace-nowrap shrink-0">{formatCurrency(line.lineTotal)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#777777]">Montant Total</span>
                <span className="text-base font-black text-[#171717]">{formatCurrency(sale.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
              {sale.status === 'DRAFT' && (
                <>
                  <button
                    disabled={isBusy}
                    onClick={() => runAction(() => salesClient.cancelSale(shopId, sale.id))}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-all disabled:opacity-60"
                  >
                    <Ban size={14} />
                    <span>Annuler</span>
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={() => runAction(() => salesClient.validateSale(shopId, sale.id))}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all disabled:opacity-60"
                  >
                    <Check size={14} />
                    <span>Valider</span>
                  </button>
                </>
              )}

              {sale.status === 'VALIDATED' && canManage && (
                <button
                  disabled={isBusy}
                  onClick={() => runAction(() => salesClient.refundSale(shopId, sale.id))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200 transition-all disabled:opacity-60"
                >
                  <Undo2 size={14} />
                  <span>Rembourser</span>
                </button>
              )}

              <button onClick={onClose} className="px-6 py-2.5 rounded-2xl bg-stone-100 text-[#171717] font-bold text-xs hover:bg-stone-200">
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
