import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  X,
  ArrowRight,
  TrendingUp,
  Boxes,
  Store,
} from 'lucide-react'
import { Product, Order, Customer, ActiveTab } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  orders: Order[]
  customers: Customer[]
  onSelectProduct: (product: Product) => void
  onSelectOrder: (order: Order) => void
  onSelectCustomer: (customer: Customer) => void
  setActiveTab?: (tab: ActiveTab) => void
  onNavigate?: (tab: ActiveTab) => void
}

export function CommandPalette({
  isOpen,
  onClose,
  products,
  orders,
  customers,
  onSelectProduct,
  onSelectOrder,
  onSelectCustomer,
  setActiveTab,
  onNavigate,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  const handleNav = onNavigate || setActiveTab || (() => {})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setSearch('')
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 4)

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3)

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  ).slice(0, 3)

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
          {/* Input Box */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 bg-[#FBFBFA]">
            <Search size={20} className="text-[#171717]" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit, une commande, un client ou une action..."
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

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Quick Actions Shortcuts */}
            {!search && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2">
                  Actions Rapides
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleNav('pos')
                      onClose()
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F6F3] hover:bg-[#FFF4BF] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FFD43B] flex items-center justify-center text-[#171717]">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">Ouvrir la Caisse POS</p>
                      <p className="text-[10px] text-stone-500">Encaissement rapide</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleNav('analytics')
                      onClose()
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F6F3] hover:bg-[#FFF4BF] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">Analyses & Rapports</p>
                      <p className="text-[10px] text-stone-500">Rapport de ventes</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Products Section */}
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
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#171717] truncate">{p.name}</p>
                        <p className="text-[11px] text-stone-500">
                          {p.category} • SKU: {p.sku} • Stock: {p.stock}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#171717]">
                        {formatCurrency(p.price)}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-stone-300 group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Section */}
            {filteredOrders.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center justify-between">
                  <span>Commandes ({filteredOrders.length})</span>
                  <ShoppingBag size={13} />
                </div>
                <div className="space-y-1">
                  {filteredOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        onSelectOrder(o)
                        onClose()
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F6F3] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-xs text-[#171717]">
                          #
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171717]">{o.orderNumber}</p>
                          <p className="text-[11px] text-stone-500">{o.customerName} • {o.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#171717]">{formatCurrency(o.totalAmount)}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {o.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customers Section */}
            {filteredCustomers.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center justify-between">
                  <span>Clients ({filteredCustomers.length})</span>
                  <Users size={13} />
                </div>
                <div className="space-y-1">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCustomer(c)
                        onClose()
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-[#F6F6F3] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#171717]">{c.name}</p>
                          <p className="text-[11px] text-stone-500">{c.phone} • {c.city}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF4BF] text-[#171717]">
                        {c.tier}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {search &&
              filteredProducts.length === 0 &&
              filteredOrders.length === 0 &&
              filteredCustomers.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-[#171717]">Aucun résultat pour « {search} »</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Vérifiez l'orthographe ou essayez avec un autre mot-clé.
                  </p>
                </div>
              )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
