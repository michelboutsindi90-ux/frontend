import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Package, ShoppingBag, X, ArrowRight, CreditCard } from 'lucide-react'
import { Product, Sale, ActiveTab } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  sales: Sale[]
  onSelectProduct: (product: Product) => void
  onSelectSale: (sale: Sale) => void
  onNavigate: (tab: ActiveTab) => void
}

export function CommandPalette({
  isOpen,
  onClose,
  products,
  sales,
  onSelectProduct,
  onSelectSale,
  onNavigate,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else setSearch('')
      }
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 5)

  const filteredSales = search
    ? sales.filter((s) => s.id.toLowerCase().includes(search.toLowerCase())).slice(0, 4)
    : []

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 bg-[#FBFBFA]">
            <Search size={20} className="text-[#171717]" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit ou une action..."
              className="flex-1 bg-transparent text-sm text-[#171717] font-medium outline-none placeholder:text-stone-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-300"
              >
                <X size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs font-semibold text-stone-500 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200"
            >
              Échap
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {!search && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2">
                  Actions Rapides
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onNavigate('pos')
                      onClose()
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F6F3] hover:bg-[#FFF4BF] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">Ouvrir la Caisse</p>
                      <p className="text-[10px] text-stone-500">Encaissement rapide</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('sales')
                      onClose()
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F6F3] hover:bg-[#FFF4BF] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">Historique des ventes</p>
                      <p className="text-[10px] text-stone-500">Consulter les transactions</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center justify-between">
                  <span>Produits ({filteredProducts.length})</span>
                  <Package size={13} />
                </div>
                <div className="space-y-1">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProduct(p)
                        onClose()
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-[#F6F6F3] transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F6F6F3] flex items-center justify-center text-stone-500 shrink-0">
                        <Package size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#171717] truncate">{p.name}</p>
                        <p className="text-[11px] text-stone-500">SKU: {p.sku}</p>
                      </div>
                      <span className="text-xs font-bold text-[#171717]">{formatCurrency(p.price)}</span>
                      <ArrowRight size={14} className="text-stone-300 group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredSales.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center justify-between">
                  <span>Ventes ({filteredSales.length})</span>
                  <ShoppingBag size={13} />
                </div>
                <div className="space-y-1">
                  {filteredSales.map((s) => {
                    const badge = getStatusBadge(s.status)
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectSale(s)
                          onClose()
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F6F3] transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-xs text-[#171717]">
                            #
                          </div>
                          <p className="text-xs font-bold text-[#171717] font-mono">{s.id.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#171717]">{formatCurrency(s.totalAmount)}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {search && filteredProducts.length === 0 && filteredSales.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-[#171717]">Aucun résultat pour « {search} »</p>
                <p className="text-[11px] text-stone-500 mt-1">Vérifiez l'orthographe ou essayez un autre mot-clé.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
