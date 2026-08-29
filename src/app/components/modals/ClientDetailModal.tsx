import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Heart,
  FileText,
  Save,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { Customer, Order } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface ClientDetailModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  orders: Order[]
  onUpdateCustomer: (updated: Customer) => void
  onSelectOrder: (order: Order) => void
}

export function ClientDetailModal({
  customer,
  isOpen,
  onClose,
  orders,
  onUpdateCustomer,
  onSelectOrder,
}: ClientDetailModalProps) {
  if (!isOpen || !customer) return null

  const [notes, setNotes] = useState(customer.notes)
  const [isSaved, setIsSaved] = useState(false)

  const clientOrders = orders.filter(
    (o) =>
      o.customerEmail.toLowerCase() === customer.email.toLowerCase() ||
      o.customerName.toLowerCase() === customer.name.toLowerCase()
  )

  const handleSaveNotes = () => {
    onUpdateCustomer({ ...customer, notes })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 1500)
  }

  const handleWhatsApp = () => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

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
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FFD43B]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#171717]">{customer.name}</h2>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFF4BF] text-[#171717] border border-[#FFD43B]/40">
                    Client {customer.tier}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{customer.city} • Dernière commande : {customer.lastOrderDate}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Quick Action Contact Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <MessageSquare size={15} />
                <span>WhatsApp Client</span>
              </button>

              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200 text-[#171717] font-bold text-xs transition-colors"
              >
                <Phone size={15} />
                <span>{customer.phone}</span>
              </a>

              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200 text-[#171717] font-bold text-xs transition-colors"
              >
                <Mail size={15} />
                <span>{customer.email}</span>
              </a>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FFF4BF]/50 border border-[#FFD43B]/30">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Total Dépensé</p>
                <h3 className="text-xl font-black text-[#171717] mt-1">{formatCurrency(customer.totalSpent)}</h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#F6F6F3]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Commandes Totales</p>
                <h3 className="text-xl font-black text-[#171717] mt-1">{customer.ordersCount}</h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#F6F6F3]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Panier Moyen</p>
                <h3 className="text-xl font-black text-[#171717] mt-1">
                  {formatCurrency(Math.round(customer.totalSpent / (customer.ordersCount || 1)))}
                </h3>
              </div>
            </div>

            {/* Favorite Products */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Heart size={13} className="text-rose-500 fill-rose-500" />
                <span>Produits Préférés</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {customer.favoriteProducts.map((fav, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-[#F6F6F3] text-xs font-bold text-[#171717] border border-stone-200"
                  >
                    {fav}
                  </span>
                ))}
              </div>
            </div>

            {/* Orders History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <ShoppingBag size={13} />
                <span>Historique des commandes récentes</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientOrders.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Aucune commande enregistrée.</p>
                ) : (
                  clientOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        onClose()
                        onSelectOrder(o)
                      }}
                      className="p-3 rounded-2xl bg-[#FBFBFA] border border-stone-100 hover:border-stone-300 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#171717]">{o.orderNumber}</p>
                        <p className="text-[11px] text-stone-400">{o.date} • {o.items.length} articles</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#171717]">{formatCurrency(o.totalAmount)}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes Section with Save */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>Notes Commerçant (Privé)</span>
                </h4>
                {isSaved && (
                  <span className="text-xs font-bold text-emerald-600">Note enregistrée !</span>
                )}
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Préférences de livraison, anniversaires, remises accordées..."
                className="w-full p-3 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white resize-none"
              />
              <div className="text-right">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold hover:bg-black transition-all"
                >
                  Sauvegarder la note
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
