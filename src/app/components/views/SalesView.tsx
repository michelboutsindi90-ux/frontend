import React, { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { Sale } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

interface SalesViewProps {
  sales: Sale[]
  onSelectSale: (sale: Sale) => void
}

export function SalesView({ sales, onSelectSale }: SalesViewProps) {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const totalSales = sales.length
  const validatedSales = sales.filter((s) => s.status === 'VALIDATED').length
  const draftSales = sales.filter((s) => s.status === 'DRAFT').length
  const cancelledSales = sales.filter((s) => s.status === 'CANCELLED' || s.status === 'REFUNDED').length

  const filteredSales = sales.filter((s) => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = selectedStatus === 'all' || s.status === selectedStatus
    return matchSearch && matchStatus
  })

  return (
    <div id="sales-view" className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#171717] tracking-tight">Historique des Ventes</h1>
        <p className="text-xs text-[#777777] mt-0.5">Suivez toutes les transactions enregistrées en caisse.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Total Ventes</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{totalSales}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Validées</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{validatedSales}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-[#FFF4BF]/60 border border-[#FFD43B]/40 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Brouillons</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{draftSales}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Annulées / Remboursées</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{cancelledSales}</h3>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par identifiant de vente..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-medium text-[#171717] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'DRAFT', label: 'Brouillon' },
            { id: 'VALIDATED', label: 'Validée' },
            { id: 'CANCELLED', label: 'Annulée' },
            { id: 'REFUNDED', label: 'Remboursée' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === s.id ? 'bg-[#171717] text-white shadow-xs' : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-stone-100 bg-[#FBFBFA] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-4">Vente</th>
                <th className="py-3.5 px-4">Articles</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.map((sale) => {
                const badge = getStatusBadge(sale.status)
                return (
                  <tr key={sale.id} onClick={() => onSelectSale(sale)} className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group">
                    <td className="py-4 pl-6 pr-4 font-extrabold text-[#171717] font-mono whitespace-nowrap">{sale.id.slice(0, 8)}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-stone-700 font-semibold">
                      {sale.lines?.length ?? 0} article{(sale.lines?.length ?? 0) > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 font-black text-[#171717] whitespace-nowrap">{formatCurrency(sale.totalAmount)}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectSale(sale)
                        }}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-[#FFD43B] text-stone-700 hover:text-[#171717] transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    Aucune vente trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
