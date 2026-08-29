import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Star,
  Package,
  TrendingUp,
  Truck,
  Edit3,
  Check,
  Plus,
  Minus,
  AlertTriangle,
  Tag,
  Share2,
  Trash2,
} from 'lucide-react'
import { Product } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onUpdateProduct: (updated: Product) => void
  onDeleteProduct: (productId: string) => void
  onReplenish: (product: Product) => void
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onUpdateProduct,
  onDeleteProduct,
  onReplenish,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editPrice, setEditPrice] = useState(product.price)
  const [editStock, setEditStock] = useState(product.stock)
  const [editDesc, setEditDesc] = useState(product.description)

  const statusBadge = getStatusBadge(product.status)
  const marginAmount = product.price - product.costPrice
  const marginPercent = ((marginAmount / product.price) * 100).toFixed(1)

  const handleStockChange = (delta: number) => {
    const newStock = Math.max(0, product.stock + delta)
    const newStatus =
      newStock === 0
        ? 'out_of_stock'
        : newStock <= product.alertThreshold
        ? 'low_stock'
        : 'in_stock'
    onUpdateProduct({ ...product, stock: newStock, status: newStatus })
  }

  const handleSaveEdit = () => {
    const newStatus =
      editStock === 0
        ? 'out_of_stock'
        : editStock <= product.alertThreshold
        ? 'low_stock'
        : 'in_stock'
    onUpdateProduct({
      ...product,
      price: Number(editPrice),
      stock: Number(editStock),
      description: editDesc,
      status: newStatus,
    })
    setIsEditing(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#FFF4BF] text-[#171717] border border-[#FFD43B]/40">
                SKU: {product.sku}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isEditing
                    ? 'bg-[#171717] text-white'
                    : 'bg-stone-100 hover:bg-[#FFD43B] text-[#171717]'
                }`}
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'Mode édition actif' : 'Modifier'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Left: Gallery and Main Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden bg-[#F6F6F3] border border-stone-200/80 relative shadow-inner">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#171717] shadow-sm">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>{product.rating}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx
                          ? 'border-[#FFD43B] ring-2 ring-[#FFD43B]/40 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Sales Mini Stat Card */}
              <div className="p-4 rounded-2xl bg-[#F6F6F3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#171717] text-[#FFD43B] flex items-center justify-center">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171717]">Performance</p>
                    <p className="text-[11px] text-[#777777]">{product.salesCount} ventes cumulées</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Best-Seller
                </span>
              </div>
            </div>

            {/* Right: Details & Adjustments */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-[#777777] uppercase tracking-wider">
                  {product.category}
                </p>
                <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight mt-1 leading-snug">
                  {product.name}
                </h2>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {product.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price & Margin Block */}
                {isEditing ? (
                  <div className="mt-4 p-4 rounded-2xl bg-[#F6F6F3] space-y-3">
                    <label className="block text-xs font-bold text-[#171717]">
                      Modifier le prix de vente (FCFA)
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-sm"
                    />
                  </div>
                ) : (
                  <div className="mt-5 p-4 rounded-2xl bg-[#FFF4BF]/50 border border-[#FFD43B]/40 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-[#777777]">Prix de vente (TTC)</p>
                      <h3 className="text-2xl font-black text-[#171717]">
                        {formatCurrency(product.price)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-emerald-800">
                        Marge : +{formatCurrency(marginAmount)}
                      </p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {marginPercent}% brute
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Description
                  </h4>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#F6F6F3] border border-stone-200 text-xs text-[#171717]"
                    />
                  ) : (
                    <p className="text-xs text-stone-600 leading-relaxed">{product.description}</p>
                  )}
                </div>

                {/* Inventory Adjustment Stepper */}
                <div className="mt-5 p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#171717]">Stock en rayon / réserve</h4>
                      <p className="text-[11px] text-stone-500">
                        Seuil d'alerte : {product.alertThreshold} unités
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStockChange(-1)}
                        className="w-8 h-8 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                        title="Diminuer stock (-1)"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-black text-[#171717] min-w-[36px] text-center">
                        {product.stock}
                      </span>
                      <button
                        onClick={() => handleStockChange(1)}
                        className="w-8 h-8 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                        title="Augmenter stock (+1)"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {product.stock <= product.alertThreshold && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs text-amber-800">
                      <span className="flex items-center gap-1 font-semibold">
                        <AlertTriangle size={13} /> Stock critique
                      </span>
                      <button
                        onClick={() => onReplenish(product)}
                        className="font-bold underline text-[#171717]"
                      >
                        Commander du stock
                      </button>
                    </div>
                  )}
                </div>

                {/* Supplier Info */}
                <div className="mt-4 flex items-center justify-between text-xs text-stone-600 px-1">
                  <span className="flex items-center gap-1.5">
                    <Truck size={14} className="text-stone-400" />
                    Fournisseur : <strong className="text-[#171717]">{product.supplier}</strong>
                  </span>
                  <span>Coût d'achat : {formatCurrency(product.costPrice)}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <Trash2 size={15} />
                  <span>Supprimer</span>
                </button>

                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-extrabold text-xs shadow-md shadow-[#FFD43B]/30"
                  >
                    <Check size={16} />
                    <span>Sauvegarder les modifications</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onReplenish(product)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#171717] text-white font-bold text-xs hover:bg-black transition-all"
                  >
                    <Package size={15} className="text-[#FFD43B]" />
                    <span>Réapprovisionner</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
