import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { ProductWithStock } from '../../types'
import { formatCurrency, getStatusBadge, getStockStatus } from '../../utils/formatters'

interface StockViewProps {
  products: ProductWithStock[]
  canManage: boolean
  onReplenishProduct: (product: ProductWithStock) => void
  onSelectProduct: (product: ProductWithStock) => void
}

export function StockView({ products, canManage, onReplenishProduct, onSelectProduct }: StockViewProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')

  const statuses = products.map((p) => getStockStatus(p.stock?.quantity ?? 0, p.stock?.lowStockAlert ?? 0))
  const totalUnits = products.reduce((acc, p) => acc + (p.stock?.quantity ?? 0), 0)
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock?.quantity ?? 0) * p.price, 0)
  const lowStockCount = statuses.filter((s) => s === 'low_stock').length
  const outOfStockCount = statuses.filter((s) => s === 'out_of_stock').length
  const normalStockCount = statuses.filter((s) => s === 'in_stock').length

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const status = getStockStatus(p.stock?.quantity ?? 0, p.stock?.lowStockAlert ?? 0)
    if (filter === 'low') return matchSearch && status === 'low_stock'
    if (filter === 'out') return matchSearch && status === 'out_of_stock'
    return matchSearch
  })

  return (
    <div id="stock-view" className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#171717] tracking-tight">Gestion des Stocks & Alertes</h1>
        <p className="text-xs text-[#777777] mt-0.5">Surveillez les niveaux de stock et prévenez les ruptures.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Stock Total</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{totalUnits} unités</h3>
          <p className="text-[11px] text-stone-400 mt-1">Valeur: {formatCurrency(totalStockValue)}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Disponibles</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{normalStockCount} refs</h3>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF4BF]/70 border border-[#FFD43B]/50 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Stock Faible</p>
          <h3 className="text-2xl font-black text-amber-900 mt-1">{lowStockCount} refs</h3>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Ruptures</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{outOfStockCount} refs</h3>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par article ou SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F6F6F3] text-xs font-medium text-[#171717] outline-none"
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'Tout le stock' },
              { id: 'low', label: 'Stock Faible' },
              { id: 'out', label: 'Ruptures' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f.id ? 'bg-[#171717] text-white' : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-stone-100 bg-[#FBFBFA] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-4">Produit</th>
                <th className="py-3.5 px-4">Stock Actuel</th>
                <th className="py-3.5 px-4">Seuil d'Alerte</th>
                <th className="py-3.5 px-4">Valeur en Stock</th>
                <th className="py-3.5 px-4">Statut</th>
                {canManage && <th className="py-3.5 pl-4 pr-6 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const quantity = p.stock?.quantity ?? 0
                const lowStockAlert = p.stock?.lowStockAlert ?? 0
                const status = getStockStatus(quantity, lowStockAlert)
                const badge = getStatusBadge(status)
                const isUrgent = status !== 'in_stock'

                return (
                  <tr key={p.id} onClick={() => onSelectProduct(p)} className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group">
                    <td className="py-4 pl-6 pr-4">
                      <p className="font-bold text-[#171717] group-hover:text-stone-900 truncate max-w-[220px]">{p.name}</p>
                      <p className="text-[11px] text-stone-400 font-mono truncate">SKU: {p.sku}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`text-sm font-black ${isUrgent ? 'text-amber-900' : 'text-[#171717]'}`}>{quantity} unités</span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-medium whitespace-nowrap">{lowStockAlert} unités</td>
                    <td className="py-4 px-4 font-bold text-[#171717] whitespace-nowrap">{formatCurrency(quantity * p.price)}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onReplenishProduct(p)
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                            isUrgent ? 'bg-[#FFD43B] text-[#171717] hover:brightness-105' : 'bg-stone-100 text-stone-700 hover:bg-[#FFD43B] hover:text-[#171717]'
                          }`}
                        >
                          Ajuster
                        </button>
                      </td>
                    )}
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
