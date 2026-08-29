import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Truck,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react'
import { Product } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

interface StockViewProps {
  products: Product[]
  onReplenishProduct: (product: Product) => void
  onSelectProduct: (product: Product) => void
}

export function StockView({
  products,
  onReplenishProduct,
  onSelectProduct,
}: StockViewProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')

  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0)
  const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.price, 0)
  const lowStockCount = products.filter((p) => p.status === 'low_stock').length
  const outOfStockCount = products.filter((p) => p.status === 'out_of_stock').length
  const normalStockCount = products.filter((p) => p.status === 'in_stock').length

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    if (filter === 'low') return matchSearch && p.status === 'low_stock'
    if (filter === 'out') return matchSearch && p.status === 'out_of_stock'
    return matchSearch
  })

  return (
    <div id="stock-view" className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
          Gestion des Stocks & Alertes de Réassort
        </h1>
        <p className="text-xs text-[#777777] mt-0.5">
          Surveillez les niveaux de réserve, prévenez les ruptures et gérez vos approvisionnements fournisseurs.
        </p>
      </div>

      {/* Stock KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Stock Total en Réserve</p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">{totalUnits} unités</h3>
          <p className="text-[11px] text-stone-400 mt-1">Valeur: {formatCurrency(totalStockValue)}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Disponibles</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{normalStockCount} refs</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Niveau optimal</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF4BF]/70 border border-[#FFD43B]/50 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Stock Faible (Alerte)</p>
          <h3 className="text-2xl font-black text-amber-900 mt-1">{lowStockCount} refs</h3>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">Réassort suggéré</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Ruptures de stock</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{outOfStockCount} refs</h3>
          <p className="text-[11px] text-rose-700 font-semibold mt-1">Action urgente requise</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par article ou référence SKU..."
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
                filter === f.id
                  ? 'bg-[#171717] text-white'
                  : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-stone-100 bg-[#FBFBFA] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-4">Produit</th>
                <th className="py-3.5 px-4">Fournisseur</th>
                <th className="py-3.5 px-4">Stock Actuel</th>
                <th className="py-3.5 px-4">Seuil d'Alerte</th>
                <th className="py-3.5 px-4">Valeur en Stock</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Réapprovisionner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const badge = getStatusBadge(p.status)
                const isUrgent = p.status === 'low_stock' || p.status === 'out_of_stock'

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-2xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#171717] group-hover:text-stone-900 truncate max-w-[200px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-stone-400 font-mono truncate">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-600 font-semibold whitespace-nowrap">{p.supplier}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-black ${
                          isUrgent ? 'text-amber-900' : 'text-[#171717]'
                        }`}
                      >
                        {p.stock} unités
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-medium whitespace-nowrap">{p.alertThreshold} unités</td>
                    <td className="py-4 px-4 font-bold text-[#171717] whitespace-nowrap">
                      {formatCurrency(p.stock * p.price)}
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
                          onReplenishProduct(p)
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                          isUrgent
                            ? 'bg-[#FFD43B] text-[#171717] hover:brightness-105'
                            : 'bg-stone-100 text-stone-700 hover:bg-[#FFD43B] hover:text-[#171717]'
                        }`}
                      >
                        + Commander
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
