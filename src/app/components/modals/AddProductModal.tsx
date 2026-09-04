import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check, Plus, Package, Printer, QrCode } from 'lucide-react'
import { Category, Product } from '../../types'
import * as productsClient from '../../lib/resources/products'
import * as categoriesClient from '../../lib/resources/categories'
import * as stockClient from '../../lib/resources/stock'
import { ApiError } from '../../lib/apiClient'
import { CategorySelect } from '../ui/CategorySelect'
import { PrintQrModal } from './PrintQrModal'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  shopId: string
  categories: Category[]
  onCategoryCreated: (category: Category) => void
  onCreated: () => void
}

export function AddProductModal({
  isOpen,
  onClose,
  shopId,
  categories,
  onCategoryCreated,
  onCreated,
}: AddProductModalProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [sku, setSku] = useState('')
  const [initialStock, setInitialStock] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null)
  const [createdQrUrl, setCreatedQrUrl] = useState<string | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  if (!isOpen) return null

  const resetAndClose = () => {
    setName('')
    setSku('')
    setPrice(0)
    setInitialStock(0)
    setCreatedProduct(null)
    setCreatedQrUrl(null)
    onClose()
  }

  const handleCreateCategory = async (categoryName: string) => {
    const created = await categoriesClient.createCategory(shopId, categoryName)
    onCategoryCreated(created)
    return created
  }

  const generateSku = () => {
    const rand = Math.floor(1000 + Math.random() * 9000)
    setSku(`SKU-${rand}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !categoryId) return

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const finalSku = sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`
      const product = await productsClient.createProduct(shopId, {
        name: name.trim(),
        sku: finalSku,
        price: Number(price),
        categoryId,
      })

      if (initialStock > 0) {
        await stockClient.adjustStock(shopId, product.id, { type: 'RESTOCK', quantity: Number(initialStock) })
      }

      onCreated()

      // Show the freshly generated QR code right away instead of just closing —
      // the merchant needs to see/print it to label the physical product.
      setCreatedProduct(product)
      productsClient
        .fetchQrCodeImageUrl(shopId, product.id)
        .then(setCreatedQrUrl)
        .catch(() => {
          // QR fetch failing shouldn't block the success confirmation
        })
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible de créer ce produit.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        >
          {createdProduct ? (
            <>
              <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#171717] tracking-tight">Produit enregistré !</h2>
                    <p className="text-xs text-[#777777]">Voici son QR code — à coller sur l'article.</p>
                  </div>
                </div>
                <button
                  onClick={resetAndClose}
                  className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="aspect-square max-w-[220px] mx-auto rounded-3xl overflow-hidden bg-[#F6F6F3] border border-stone-200/80 flex items-center justify-center shadow-inner">
                  {createdQrUrl ? (
                    <img src={createdQrUrl} alt={`QR code ${createdProduct.name}`} className="w-3/4 h-3/4 object-contain" />
                  ) : (
                    <QrCode size={56} className="text-stone-300" />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-extrabold text-[#171717]">{createdProduct.name}</p>
                  <p className="text-xs text-[#777777] font-mono">SKU: {createdProduct.sku}</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    disabled={!createdQrUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#171717] hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-60"
                  >
                    <Printer size={14} />
                    <span>Imprimer</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-1 py-3 rounded-2xl bg-[#FFD43B] hover:brightness-105 text-[#171717] text-xs font-extrabold shadow-lg shadow-[#FFD43B]/30 transition-all"
                  >
                    Terminé
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#171717] tracking-tight">Ajouter un produit</h2>
                <p className="text-xs text-[#777777]">Complétez les informations pour publier au catalogue.</p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Nom du produit *</label>
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
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Catégorie *</label>
              <CategorySelect
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
                onCreateCategory={handleCreateCategory}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">Prix de vente (FCFA) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">Stock initial</label>
                <input
                  type="number"
                  min={0}
                  value={initialStock}
                  onChange={(e) => setInitialStock(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#171717]">Référence SKU</label>
                <button type="button" onClick={generateSku} className="text-[10px] text-[#171717] font-bold underline">
                  Générer
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ex: SKU-1042"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs font-bold text-stone-800 outline-none focus:border-[#FFD43B] focus:bg-white"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Annuler
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting || !categoryId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-extrabold shadow-lg transition-all disabled:opacity-60 bg-[#FFD43B] text-[#171717] shadow-[#FFD43B]/40 hover:brightness-105"
              >
                {isSubmitting ? (
                  <span>Enregistrement...</span>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Enregistrer le produit</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
            </>
          )}
        </motion.div>
      </div>

      <PrintQrModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        qrUrl={createdQrUrl}
        productName={createdProduct?.name ?? ''}
        sku={createdProduct?.sku ?? ''}
      />
    </AnimatePresence>
  )
}
