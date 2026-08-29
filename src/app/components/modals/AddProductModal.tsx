import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  UploadCloud,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Boxes,
  Truck,
  Image as ImageIcon,
} from 'lucide-react'
import { Product, Supplier } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import confetti from 'canvas-confetti'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (product: Omit<Product, 'id' | 'salesCount' | 'rating'>) => void
  suppliers: Supplier[]
}

export function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  suppliers,
}: AddProductModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Maroquinerie')
  const [price, setPrice] = useState<number>(35000)
  const [costPrice, setCostPrice] = useState<number>(15000)
  const [stock, setStock] = useState<number>(20)
  const [alertThreshold, setAlertThreshold] = useState<number>(5)
  const [sku, setSku] = useState('')
  const [supplier, setSupplier] = useState(suppliers[0]?.name || 'Atelier Cuir Abidjan')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Auto-generate SKU if blank
  const generateSku = () => {
    const prefix = category.substring(0, 3).toUpperCase()
    const rand = Math.floor(100 + Math.random() * 900)
    setSku(`MERC-${prefix}-${rand}`)
  }

  const handleImageAdd = () => {
    const catalogStockImages = [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    ]
    const nextUrl = catalogStockImages[images.length % catalogStockImages.length]
    setImages([...images, nextUrl])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    setTimeout(() => {
      const finalSku = sku || `MERC-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
      const status = stock === 0 ? 'out_of_stock' : stock <= alertThreshold ? 'low_stock' : 'in_stock'

      onAddProduct({
        name,
        category,
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
        alertThreshold: Number(alertThreshold),
        sku: finalSku,
        supplier,
        description: description || 'Produit d’exception sélectionné par la boutique Mercato.',
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'],
        status,
        tags: ['Nouveau', category],
      })

      setIsSubmitting(false)
      setIsSuccess(true)

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD43B', '#171717', '#FFF4BF'],
        })
      } catch (err) {
        // ignore
      }

      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 1200)
    }, 600)
  }

  if (!isOpen) return null

  const marginAmount = price - costPrice
  const marginPercentage = price > 0 ? ((marginAmount / price) * 100).toFixed(1) : '0'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#171717] tracking-tight">
                  Ajouter un nouveau produit
                </h2>
                <p className="text-xs text-[#777777]">
                  Complétez les informations pour publier sur votre catalogue et votre boutique.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Sac Bandoulière Cuir Safari..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs text-[#171717] font-medium outline-none focus:border-[#FFD43B] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs text-[#171717] font-medium outline-none focus:border-[#FFD43B] focus:bg-white"
                >
                  <option value="Maroquinerie">Maroquinerie</option>
                  <option value="Cosmétique">Cosmétique</option>
                  <option value="Épicerie Fine">Épicerie Fine</option>
                  <option value="Mode & Textile">Mode & Textile</option>
                  <option value="Accessoires">Accessoires</option>
                  <option value="High-Tech">High-Tech</option>
                  <option value="Maison & Déco">Maison & Déco</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Description détaillée
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Matières, fabrication, conseils d'utilisation..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs text-[#171717] font-medium outline-none focus:border-[#FFD43B] focus:bg-white resize-none"
              />
            </div>

            {/* Pricing and Profit Margin calculation */}
            <div className="p-5 rounded-3xl bg-[#FBFBFA] border border-stone-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  Tarification & Marge
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  <span>Marge brute : {formatCurrency(marginAmount)}</span>
                  <span>({marginPercentage}%)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Prix de vente client (TTC) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">
                      FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Prix d'achat fournisseur (Coût)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-bold text-stone-700 outline-none focus:border-[#FFD43B]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">
                      FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory & Stock rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Stock initial
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Seuil d'alerte stock
                </label>
                <input
                  type="number"
                  min={1}
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-bold text-stone-700 outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#171717]">Référence SKU</label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="text-[10px] text-[#171717] font-bold underline"
                  >
                    Générer
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="ex: MERC-MAR-102"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-bold text-stone-800 outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>
            </div>

            {/* Supplier & Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Fournisseur associé
                </label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and drop image dropzone */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Galerie photos
                </label>
                <div
                  onClick={handleImageAdd}
                  className="border-2 border-dashed border-stone-200 hover:border-[#FFD43B] bg-[#FBFBFA] rounded-2xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2 group"
                >
                  <UploadCloud size={18} className="text-stone-400 group-hover:text-[#171717]" />
                  <span className="text-xs font-semibold text-stone-600 group-hover:text-[#171717]">
                    + Ajouter une photo ({images.length} actuelle{images.length > 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>

            {/* Image Preview thumbnails */}
            {images.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Annuler
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting || isSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-extrabold shadow-lg transition-all ${
                  isSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-[#FFD43B] text-[#171717] shadow-[#FFD43B]/40 hover:brightness-105'
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check size={16} className="stroke-[3]" />
                    <span>Produit Enregistré !</span>
                  </>
                ) : isSubmitting ? (
                  <span>Enregistrement en cours...</span>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Enregistrer le produit</span>
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
