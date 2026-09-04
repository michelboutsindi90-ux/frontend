import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, Minus, Trash2, Check, ShoppingBag, RotateCcw, Zap, PackageOpen, ScanLine } from 'lucide-react'
import { ProductWithStock, SaleLine } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import * as salesClient from '../../lib/resources/sales'
import * as productsClient from '../../lib/resources/products'
import { ApiError } from '../../lib/apiClient'
import { QrScannerModal } from '../modals/QrScannerModal'

function getCurrentPosition(): Promise<{ latitude: number; longitude: number } | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(undefined),
      { timeout: 4000 }
    )
  })
}

interface PosViewProps {
  products: ProductWithStock[]
  categories: { id: string; name: string }[]
  shopId: string
  onSaleCompleted: () => void
  onOpenProducts: () => void
}

export function PosView({ products, categories, shopId, onSaleCompleted, onOpenProducts }: PosViewProps) {
  const [saleId, setSaleId] = useState<string | null>(null)
  const [lines, setLines] = useState<SaleLine[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [completedTotal, setCompletedTotal] = useState<number | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const availableProducts = products.filter((p) => (p.stock?.quantity ?? 0) > 0)
  const filteredProducts = availableProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId
    return matchSearch && matchCat
  })

  const ensureSale = async (): Promise<string> => {
    if (saleId) return saleId
    const sale = await salesClient.createSale(shopId, crypto.randomUUID())
    setSaleId(sale.id)
    setLines(sale.lines ?? [])
    return sale.id
  }

  const addToCart = async (product: ProductWithStock) => {
    setErrorMessage(null)
    setIsBusy(true)
    try {
      const currentSaleId = await ensureSale()
      const existing = lines.find((l) => l.productId === product.id)
      const maxStock = product.stock?.quantity ?? 0
      if (existing && existing.quantity >= maxStock) return
      const updatedSale = await salesClient.addSaleLine(shopId, currentSaleId, { productId: product.id, quantity: 1 })
      setLines(updatedSale.lines ?? [])
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Impossible d'ajouter cet article.")
    } finally {
      setIsBusy(false)
    }
  }

  const handleScanDecoded = async (token: string) => {
    setIsScannerOpen(false)
    setErrorMessage(null)
    setIsBusy(true)
    try {
      const location = await getCurrentPosition()
      const scanned = await productsClient.scanProduct(shopId, token, location)
      const matched = products.find((p) => p.id === scanned.id)
      if (!matched) {
        setErrorMessage("Produit scanné introuvable dans le catalogue chargé. Rafraîchissez la page.")
        return
      }
      if ((matched.stock?.quantity ?? 0) <= 0) {
        setErrorMessage(`"${matched.name}" est en rupture de stock.`)
        return
      }
      await addToCart(matched)
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.status === 404
            ? 'QR code invalide ou inconnu pour cette boutique.'
            : err.message
          : 'Impossible de traiter ce scan.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  const updateQuantity = async (line: SaleLine, delta: number) => {
    if (!saleId) return
    const nextQty = line.quantity + delta
    setIsBusy(true)
    setErrorMessage(null)
    try {
      if (nextQty <= 0) {
        const updatedSale = await salesClient.removeSaleLine(shopId, saleId, line.id)
        setLines(updatedSale.lines ?? [])
      } else {
        const product = products.find((p) => p.id === line.productId)
        if (product && nextQty > (product.stock?.quantity ?? 0)) return
        const updatedSale = await salesClient.updateSaleLine(shopId, saleId, line.id, nextQty)
        setLines(updatedSale.lines ?? [])
      }
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Impossible de mettre à jour la quantité.")
    } finally {
      setIsBusy(false)
    }
  }

  const removeItem = async (line: SaleLine) => {
    if (!saleId) return
    setIsBusy(true)
    try {
      const updatedSale = await salesClient.removeSaleLine(shopId, saleId, line.id)
      setLines(updatedSale.lines ?? [])
    } finally {
      setIsBusy(false)
    }
  }

  const clearCart = async () => {
    if (!saleId) return
    setIsBusy(true)
    try {
      await salesClient.cancelSale(shopId, saleId)
    } finally {
      setSaleId(null)
      setLines([])
      setIsBusy(false)
    }
  }

  const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0)

  const handleCheckout = async () => {
    if (!saleId || lines.length === 0) return
    setIsBusy(true)
    setErrorMessage(null)
    try {
      const sale = await salesClient.validateSale(shopId, saleId)
      setCompletedTotal(sale.totalAmount)
      setSaleId(null)
      setLines([])
      onSaleCompleted()
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Impossible de valider la vente.")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div id="pos-view" className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#171717] tracking-tight">Terminal Caisse</h1>
        <p className="text-xs text-[#777777] mt-0.5">Encaissement en boutique avec mise à jour instantanée du stock.</p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{errorMessage}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selection */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un article..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F6F6F3] text-xs font-medium text-[#171717] outline-none focus:bg-white focus:border-[#FFD43B] border border-transparent"
                />
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                disabled={isBusy}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] text-xs font-bold hover:bg-[#F5C72B] transition-all shrink-0 disabled:opacity-60"
                title="Scanner le QR code d'un produit"
              >
                <ScanLine size={15} className="text-white" />
                <span className="hidden sm:inline">Scanner</span>
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryId === 'all' ? 'bg-[#171717] text-white' : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tout
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategoryId === c.id ? 'bg-[#171717] text-white' : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {products.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 px-6">
              <PackageOpen size={36} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-sm font-extrabold text-[#171717]">Aucun produit dans cette boutique</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Ajoutez au moins un produit avec du stock avant de pouvoir encaisser une vente.
              </p>
              <button
                onClick={onOpenProducts}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30"
              >
                + Aller au catalogue
              </button>
            </div>
          )}

          {products.length > 0 && availableProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 px-6">
              <PackageOpen size={36} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-sm font-extrabold text-[#171717]">Tous les produits sont en rupture de stock</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Réapprovisionnez votre stock pour pouvoir les vendre en caisse.
              </p>
            </div>
          )}

          {availableProducts.length > 0 && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 px-6">
              <Search size={32} className="mx-auto text-stone-300 mb-3" />
              <p className="text-xs font-bold text-[#171717]">Aucun article ne correspond à votre recherche.</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inCart = lines.find((l) => l.productId === p.id)
              return (
                <motion.div
                  key={p.id}
                  onClick={() => !isBusy && addToCart(p)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col justify-between relative shadow-2xs ${
                    inCart ? 'border-[#FFD43B] ring-2 ring-[#FFD43B]/30' : 'border-stone-200/80 hover:border-stone-300'
                  } ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FFD43B] text-[#171717] font-black text-xs flex items-center justify-center shadow-xs">
                      {inCart.quantity}
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-extrabold text-[#171717] line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">Stock: {p.stock?.quantity ?? 0}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-black text-[#171717]">{formatCurrency(p.price)}</span>
                    <button className="w-6 h-6 rounded-lg bg-[#FFF4BF] text-[#171717] flex items-center justify-center font-bold">
                      <Plus size={12} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#171717]" />
                  <h3 className="font-extrabold text-sm text-[#171717]">
                    Panier ({lines.reduce((a, l) => a + l.quantity, 0)})
                  </h3>
                </div>
                {lines.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1">
                    <RotateCcw size={12} />
                    <span>Vider</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto my-3 pr-1">
                {lines.length === 0 ? (
                  <div className="text-center py-12 text-stone-400">
                    <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">Le ticket est vide</p>
                    <p className="text-[11px] text-stone-400">Touchez un produit pour l'ajouter.</p>
                  </div>
                ) : (
                  lines.map((line) => {
                    const product = products.find((p) => p.id === line.productId)
                    return (
                      <div key={line.id} className="p-2.5 rounded-2xl bg-[#FBFBFA] border border-stone-100 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#171717] truncate">{product?.name || 'Produit'}</p>
                          <p className="text-[10px] text-stone-400">{formatCurrency(line.unitPrice)}/u</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(line, -1)}
                            disabled={isBusy}
                            className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-black min-w-[18px] text-center">{line.quantity}</span>
                          <button
                            onClick={() => updateQuantity(line, 1)}
                            disabled={isBusy}
                            className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span className="text-xs font-black text-[#171717] min-w-[70px] text-right">{formatCurrency(line.lineTotal)}</span>

                        <button onClick={() => removeItem(line)} disabled={isBusy} className="text-stone-300 hover:text-rose-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex justify-between text-[#171717] font-black text-lg">
                <span>Total à Encaisser</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <motion.button
                id="pos-checkout-btn"
                disabled={lines.length === 0 || isBusy}
                onClick={handleCheckout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-sm shadow-lg shadow-[#FFD43B]/40 hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={18} className="fill-[#FFD43B]" />
                <span>Encaisser {formatCurrency(subtotal)}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {completedTotal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-2xl border border-stone-200 space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <Check size={32} className="stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">Encaissement Réussi !</h2>
              <p className="text-xs text-stone-500 mt-1">La vente a été enregistrée et le stock mis à jour.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF4BF]/60 border border-[#FFD43B]/40 font-black text-xl text-[#171717]">
              {formatCurrency(completedTotal)}
            </div>
            <button
              onClick={() => setCompletedTotal(null)}
              className="w-full py-3 rounded-2xl bg-[#FFD43B] text-[#171717] text-xs font-extrabold shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
            >
              Nouvelle Vente
            </button>
          </motion.div>
        </div>
      )}

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onDecoded={handleScanDecoded} />
    </div>
  )
}
