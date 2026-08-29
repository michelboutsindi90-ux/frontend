import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Printer,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Download,
  LucideIcon,
} from 'lucide-react'
import { Order, OrderStatus } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void
}

const timelineSteps: { key: OrderStatus; label: string; icon: LucideIcon }[] = [
  { key: 'pending', label: 'Commande reçue', icon: ShoppingBag },
  { key: 'paid', label: 'Paiement confirmé', icon: ShieldCheck },
  { key: 'preparing', label: 'Préparation colis', icon: Package },
  { key: 'shipped', label: 'Expédition en cours', icon: Truck },
  { key: 'delivered', label: 'Colis livré', icon: CheckCircle2 },
]

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const [showReceipt, setShowReceipt] = useState(false)

  if (!isOpen || !order) return null

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0
      case 'paid':
        return 1
      case 'preparing':
        return 2
      case 'shipped':
        return 3
      case 'delivered':
        return 4
      default:
        return 0
    }
  }

  const currentStepIdx = getStepIndex(order.status)
  const badge = getStatusBadge(order.status)

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
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717] font-black text-sm">
                #
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#171717]">
                    Commande {order.orderNumber}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-[#777777] mt-0.5">Enregistrée le {order.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceipt(!showReceipt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#FFD43B] text-xs font-bold text-[#171717] transition-colors"
              >
                <Printer size={14} />
                <span>{showReceipt ? 'Fermer facture' : 'Facture'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Printable Receipt Preview Modal */}
          {showReceipt ? (
            <div className="p-8 bg-[#F6F6F3] space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm max-w-lg mx-auto font-mono text-xs text-[#171717] space-y-4">
                <div className="text-center pb-4 border-b border-dashed border-stone-300">
                  <h3 className="font-extrabold text-base tracking-tight font-sans">
                    MERCATO BOUTIQUE
                  </h3>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Reçu officiel de vente • Ticket #{order.orderNumber}
                  </p>
                  <p className="text-[10px] text-stone-400 font-sans">{order.date}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold font-sans text-xs">Client : {order.customerName}</p>
                  <p className="text-stone-500 font-sans text-[11px]">{order.shippingAddress}</p>
                </div>

                <div className="pt-2 border-t border-stone-200 divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t-2 border-dashed border-stone-300 space-y-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL TTC</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>Mode de règlement :</span>
                    <span className="uppercase">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-stone-200 font-sans text-[10px] text-stone-400">
                  Merci pour votre confiance avec Mercato !
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-2xl bg-[#171717] text-white text-xs font-bold shadow-md hover:bg-black transition-all"
                >
                  Imprimer la facture
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 space-y-8">
              {/* Interactive Animated Timeline */}
              <div className="p-6 rounded-3xl bg-[#FBFBFA] border border-stone-200/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
                  Suivi d'expédition en direct
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                  {timelineSteps.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx
                    const isCurrent = idx === currentStepIdx
                    const Icon = step.icon

                    return (
                      <div
                        key={step.key}
                        onClick={() => onUpdateStatus(order.id, step.key)}
                        className={`flex flex-col items-center text-center p-3 rounded-2xl cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#FFF4BF] border border-[#FFD43B] shadow-xs'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-white border border-stone-100 text-stone-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-all ${
                            isCurrent
                              ? 'bg-[#FFD43B] text-[#171717] ring-4 ring-[#FFD43B]/20'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold leading-tight">{step.label}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold text-[#171717] bg-[#FFD43B] px-1.5 py-0.2 rounded mt-1">
                            Actuel
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Two columns: Customer & Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="p-5 rounded-3xl bg-white border border-stone-200/80 space-y-4 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Informations Acheteur
                  </h3>

                  <div className="flex items-center gap-3">
                    <img
                      src={order.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={order.customerName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FFD43B]/50"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#171717]">
                        {order.customerName}
                      </h4>
                      <p className="text-xs text-stone-500">{order.customerEmail}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-stone-400 shrink-0" />
                      <span className="font-semibold">{order.customerPhone}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                      <span>{order.shippingAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-stone-400 shrink-0" />
                      <span>Règlement : <strong className="uppercase">{order.paymentMethod}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Articles in Order */}
                <div className="p-5 rounded-3xl bg-white border border-stone-200/80 space-y-3 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Articles commandés ({order.items.length})
                  </h3>

                  <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#171717]">{item.name}</p>
                          <p className="text-[11px] text-stone-500">
                            Quantité : <strong>{item.quantity}</strong> × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-[#171717]">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#777777]">Montant Total</span>
                    <span className="text-base font-black text-[#171717]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Action Bar */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-stone-600">Changer le statut :</span>
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className="px-3 py-1.5 rounded-xl bg-[#F6F6F3] border border-stone-200 font-bold text-xs text-[#171717] outline-none"
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                    <option value="preparing">En préparation</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
