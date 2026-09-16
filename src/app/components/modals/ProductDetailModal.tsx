import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Package, Edit3, Check, Trash2, QrCode, RefreshCw, History, Printer } from 'lucide-react'
import { ProductWithStock, StockMovement, Category } from '../../types'
import { formatCurrency, getStatusBadge, getStockStatus } from '../../utils/formatters'
import * as productsClient from '../../lib/resources/products'
import * as stockClient from '../../lib/resources/stock'
import { ApiError } from '../../lib/apiClient'
import { CategorySelect } from '../ui/CategorySelect'
import * as categoriesClient from '../../lib/resources/categories'
import { PrintQrModal } from './PrintQrModal'

interface ProductDetailModalProps {
  product: ProductWithStock | null
  isOpen: boolean
  onClose: () => void
  shopId: string
  categories: Category[]
  canManage: boolean
  onUpdated: () => void
  onDeleted: () => void
  onReplenish: (product: ProductWithStock) => void
}

const movementLabels: Record<string, string> = {
  SALE: 'Vente',
  RESTOCK: 'Réassort',
  ADJUSTMENT: 'Ajustement',
  RETURN: 'Retour',
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  shopId,
  categories,
  canManage,
  onUpdated,
  onDeleted,
  onReplenish,
}: ProductDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editCategoryId, setEditCategoryId] = useState('')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [showMovements, setShowMovements] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  useEffect(() => {
    if (!product) return
    setEditName(product.name)
    setEditPrice(product.price)
    setEditCategoryId(product.categoryId)
    setIsEditing(false)
    setShowMovements(false)
    setErrorMessage(null)
    setQrUrl(null)

    let cancelled = false
    productsClient.fetchQrCodeImageUrl(shopId, product.id).then((url) => {
      if (!cancelled) setQrUrl(url)
    }).catch(() => {
      // QR fetch failing shouldn't block viewing the product
    })
    return () => {
      cancelled = true
    }
  }, [product, shopId])

  if (!isOpen || !product) return null

  const quantity = product.stock?.quantity ?? 0
  const lowStockAlert = product.stock?.lowStockAlert ?? 0
  const status = getStockStatus(quantity, lowStockAlert)
  const statusBadge = getStatusBadge(status)

  const handleSaveEdit = async () => {
    setErrorMessage(null)
    try {
      await productsClient.updateProduct(shopId, product.id, {
        name: editName,
        price: Number(editPrice),
        categoryId: editCategoryId,
      })
      setIsEditing(false)
      onUpdated()
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible de sauvegarder.')
    }
  }

  const handleDelete = async () => {
    try {
      await productsClient.deleteProduct(shopId, product.id)
      onDeleted()
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible de supprimer ce produit.')
    }
  }

  const handleRegenerateQr = async () => {
    setIsRegenerating(true)
    try {
      await productsClient.regenerateQrCode(shopId, product.id)
      const url = await productsClient.fetchQrCodeImageUrl(shopId, product.id)
      setQrUrl(url)
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible de régénérer le QR code.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleToggleMovements = async () => {
    if (!showMovements && movements.length === 0) {
      try {
        const list = await stockClient.getStockMovements(shopId, product.id)
        setMovements(list)
      } catch {
        // best-effort, table just stays empty
      }
    }
    setShowMovements(!showMovements)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl bg-white mt-auto sm:my-auto rounded-t-3xl sm:rounded-3xl max-h-[92dvh] sm:max-h-none overflow-y-auto sm:overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0 shadow-2xl border border-stone-200"
        >
          <div className="sticky top-0 z-10 sm:static px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center justify-between gap-2 bg-[#FBFBFA]">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md truncate max-w-[140px] sm:max-w-none bg-[#FFF4BF] text-[#171717] border border-[#FFD43B]/40">
                SKU: {product.sku}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canManage && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isEditing ? 'bg-[#171717] text-white' : 'bg-stone-100 hover:bg-[#FFD43B] text-[#171717]'
                  }`}
                >
                  <Edit3 size={14} />
                  <span className="hidden min-[400px]:inline">{isEditing ? 'Édition active' : 'Modifier'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            {/* Left: QR Code */}
            <div className="space-y-4">
              <div className="aspect-square w-full max-w-[240px] sm:max-w-[280px] md:max-w-none mx-auto rounded-3xl overflow-hidden bg-[#F6F6F3] border border-stone-200/80 relative shadow-inner flex items-center justify-center">
                {qrUrl ? (
                  <img src={qrUrl} alt={`QR code ${product.name}`} className="w-3/4 h-3/4 object-contain" />
                ) : (
                  <QrCode size={64} className="text-stone-300" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  disabled={!qrUrl}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#FFD43B] hover:bg-[#F5C72B] text-[#171717] text-xs font-bold transition-colors disabled:opacity-60"
                >
                  <Printer size={14} />
                  <span>Imprimer</span>
                </button>

                {canManage && (
                  <button
                    onClick={handleRegenerateQr}
                    disabled={isRegenerating}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200 text-xs font-bold text-[#171717] transition-colors disabled:opacity-60"
                  >
                    <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                    <span>{isRegenerating ? '...' : 'Régénérer'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleToggleMovements}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-[#171717] transition-colors"
              >
                <History size={14} />
                <span>{showMovements ? 'Masquer' : 'Voir'} l'historique des mouvements</span>
              </button>

              {showMovements && (
                <div className="rounded-2xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-[#FBFBFA] text-stone-400 font-bold uppercase text-[10px]">
                        <th className="py-2 pl-3 pr-2">Type</th>
                        <th className="py-2 px-2">Qté</th>
                        <th className="py-2 pr-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {movements.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-3 text-center text-stone-400">
                            Aucun mouvement enregistré.
                          </td>
                        </tr>
                      )}
                      {movements.map((m) => (
                        <tr key={m.id}>
                          <td className="py-2 pl-3 pr-2 font-semibold text-[#171717]">{movementLabels[m.type] || m.type}</td>
                          <td className="py-2 px-2">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                          <td className="py-2 pr-3 text-right text-stone-500">
                            {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F6F3] border border-stone-200 font-bold text-lg text-[#171717]"
                    />
                    <CategorySelect
                      categories={categories}
                      value={editCategoryId}
                      onChange={setEditCategoryId}
                      onCreateCategory={(name) => categoriesClient.createCategory(shopId, name)}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-[#777777] uppercase tracking-wider">{product.category?.name || '—'}</p>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[#171717] tracking-tight mt-1 leading-snug break-words">{product.name}</h2>
                  </>
                )}

                {isEditing ? (
                  <div className="mt-4 p-4 rounded-2xl bg-[#F6F6F3] space-y-3">
                    <label className="block text-xs font-bold text-[#171717]">Prix de vente (FCFA)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-sm"
                    />
                  </div>
                ) : (
                  <div className="mt-5 p-4 rounded-2xl bg-[#FFF4BF]/50 border border-[#FFD43B]/40">
                    <p className="text-[11px] font-semibold text-[#777777]">Prix de vente</p>
                    <h3 className="text-2xl font-black text-[#171717]">{formatCurrency(product.price)}</h3>
                  </div>
                )}

                <div className="mt-5 p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#171717]">Stock actuel</h4>
                      <p className="text-[11px] text-stone-500">Seuil d'alerte : {lowStockAlert} unités</p>
                    </div>
                    <span className="text-lg font-black text-[#171717]">{quantity} u.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                {canManage && (
                  <button
                    onClick={handleDelete}
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 size={15} />
                    <span>Supprimer</span>
                  </button>
                )}

                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-extrabold text-xs shadow-md shadow-[#FFD43B]/30"
                  >
                    <Check size={16} />
                    <span>Sauvegarder</span>
                  </button>
                ) : (
                  canManage && (
                    <button
                      onClick={() => onReplenish(product)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs hover:bg-[#F5C72B] transition-all ml-auto"
                    >
                      <Package size={15} />
                      <span>Ajuster le stock</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PrintQrModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        qrUrl={qrUrl}
        productName={product.name}
        sku={product.sku}
      />
    </AnimatePresence>
  )
}
