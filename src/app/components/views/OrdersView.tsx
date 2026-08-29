import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  Calendar,
  ArrowUpDown,
  Download,
} from 'lucide-react'
import { Order, OrderStatus } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

interface OrdersViewProps {
  orders: Order[]
  onSelectOrder: (order: Order) => void
}

export function OrdersView({ orders, onSelectOrder }: OrdersViewProps) {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<string>('all')

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'paid').length
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase())
    const matchStatus = selectedStatus === 'all' || o.status === selectedStatus
    const matchPayment = selectedPayment === 'all' || o.paymentMethod === selectedPayment
    return matchSearch && matchStatus && matchPayment
  })

  return (
    <div id="orders-view" className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
            Gestion des Commandes
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Suivez le cycle de vie des ventes de la prise de commande jusqu'à la livraison finale.
          </p>
        </div>

        <button
          onClick={() => alert('Export CSV des commandes généré avec succès !')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-[#F6F6F3] text-xs font-bold text-[#171717] shadow-2xs transition-all"
        >
          <Download size={15} />
          <span>Exporter (CSV)</span>
        </button>
      </div>

      {/* KPI Status Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Total Commandes</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{totalOrders}</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">100% de suivi actif</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF4BF]/60 border border-[#FFD43B]/40 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">En Attente / Prépa</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{pendingOrders}</h3>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">À expédier en priorité</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Terminées / Payées</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{completedOrders}</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Livrées sans retour</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Annulées</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{cancelledOrders}</h3>
          <p className="text-[11px] text-stone-400 font-medium mt-1">Taux d'annulation &lt; 2%</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par N° commande, nom client ou email..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-medium text-[#171717] outline-none"
            />
          </div>

          {/* Payment Method filter */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full md:w-44 px-3 py-2 rounded-2xl bg-[#F6F6F3] text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="all">Tous paiements</option>
            <option value="wave">Wave</option>
            <option value="orange_money">Orange Money</option>
            <option value="card">Carte bancaire</option>
            <option value="cash">Espèces</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Toutes les commandes' },
            { id: 'pending', label: 'En attente' },
            { id: 'paid', label: 'Payée' },
            { id: 'preparing', label: 'En préparation' },
            { id: 'shipped', label: 'Expédiée' },
            { id: 'delivered', label: 'Livrée' },
            { id: 'cancelled', label: 'Annulée' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === s.id
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-stone-100 bg-[#FBFBFA] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-4">N° Commande</th>
                <th className="py-3.5 px-4">Client & Contact</th>
                <th className="py-3.5 px-4">Articles</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Paiement</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status)
                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-6 pr-4 font-extrabold text-[#171717] whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={order.customerName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#171717] truncate max-w-[150px]">{order.customerName}</p>
                          <p className="text-[11px] text-stone-400 truncate">{order.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold text-stone-700">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 whitespace-nowrap">{order.date}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-[#171717] whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectOrder(order)
                        }}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-[#FFD43B] text-stone-700 hover:text-[#171717] transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
