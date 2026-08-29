import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  ShoppingBag,
  Heart,
  Crown,
  Download,
  Eye,
  MessageSquare,
} from 'lucide-react'
import { Customer } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface ClientsViewProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onAddCustomer: (customer: Customer) => void
}

export function ClientsView({
  customers,
  onSelectCustomer,
  onAddCustomer,
}: ClientsViewProps) {
  const [search, setSearch] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    const matchTier = selectedTier === 'all' || c.tier === selectedTier
    return matchSearch && matchTier
  })

  return (
    <div id="clients-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
            Répertoire Clients & Fidélité (CRM)
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Analysez la valeur à vie (LTV), les préférences d'achat et personnalisez le contact.
          </p>
        </div>

        <button
          onClick={() => alert('Export du carnet client effectué avec succès !')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-[#F6F6F3] text-xs font-bold text-[#171717] shadow-2xs transition-all"
        >
          <Download size={15} />
          <span>Exporter Contacts</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, email ou ville..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-medium text-[#171717] outline-none"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto">
            {['all', 'VIP', 'Régulier', 'Nouveau'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTier === t
                    ? 'bg-[#171717] text-white'
                    : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t === 'all' ? 'Tous' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            onClick={() => onSelectCustomer(customer)}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FFD43B]"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171717]">{customer.name}</h3>
                    <p className="text-xs text-stone-400">{customer.city}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    customer.tier === 'VIP'
                      ? 'bg-[#FFF4BF] text-[#171717] border border-[#FFD43B]'
                      : customer.tier === 'Régulier'
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {customer.tier === 'VIP' && '👑 '}
                  {customer.tier}
                </span>
              </div>

              {/* Metrics */}
              <div className="mt-5 grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#FBFBFA] border border-stone-100">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Dépensé</p>
                  <p className="text-xs font-black text-[#171717] mt-0.5">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Commandes</p>
                  <p className="text-xs font-black text-[#171717] mt-0.5">
                    {customer.ordersCount} cmds
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-stone-500">
                <p className="truncate">📞 {customer.phone}</p>
                <p className="truncate">✉️ {customer.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Dernier achat : {customer.lastOrderDate}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectCustomer(customer)
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#FFD43B] text-[11px] font-bold text-[#171717] transition-colors flex items-center gap-1"
              >
                <Eye size={13} />
                <span>Voir fiche</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
