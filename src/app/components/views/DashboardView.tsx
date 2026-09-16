import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { TrendingUp, ShoppingBag, Package, ArrowRight, Plus, CreditCard, AlertTriangle, Eye } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ProductWithStock, Sale, ActiveTab, ShopStats } from '../../types'
import { formatCurrency, getStatusBadge, getStockStatus } from '../../utils/formatters'
import { getShopStats } from '../../lib/resources/shops'
import { GoldenStageBackground } from '../ui/GoldenStageBackground'

interface DashboardViewProps {
  shopId: string
  products: ProductWithStock[]
  sales: Sale[]
  canManage: boolean
  setActiveTab: (tab: ActiveTab) => void
  onSelectSale: (sale: Sale) => void
  onNewProduct: () => void
  onNewSale: () => void
  onReplenishProduct: (product: ProductWithStock) => void
}

type Period = 'day' | 'week' | 'month'

function formatBucketLabel(bucket: string, period: Period): string {
  const date = new Date(bucket)
  if (Number.isNaN(date.getTime())) return bucket
  if (period === 'month') {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const compactNumber = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 })

export function DashboardView({
  shopId,
  products,
  sales,
  canManage,
  setActiveTab,
  onSelectSale,
  onNewProduct,
  onNewSale,
  onReplenishProduct,
}: DashboardViewProps) {
  const [period, setPeriod] = useState<Period>('day')
  const [chartMetric, setChartMetric] = useState<'revenue' | 'salesCount'>('revenue')
  const [stats, setStats] = useState<ShopStats | null>(null)

  useEffect(() => {
    let cancelled = false
    const days = period === 'day' ? 14 : period === 'week' ? 12 : 12
    getShopStats(shopId, { period, days }).then((data) => {
      if (!cancelled) setStats(data)
    })
    return () => {
      cancelled = true
    }
  }, [shopId, period])

  const lowStockProducts = products.filter((p) => getStockStatus(p.stock?.quantity ?? 0, p.stock?.lowStockAlert ?? 0) !== 'in_stock')
  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div id="dashboard-view" className="space-y-5 sm:space-y-8 pb-6 md:pb-16">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl p-5 sm:p-7 min-h-[160px] sm:min-h-[180px] flex flex-col justify-center"
      >
        <GoldenStageBackground showPodium={true} showParticles={true} intensity="medium" className="opacity-90" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181F]/90 backdrop-blur-md border border-[#FFD43B]/30 text-xs font-semibold text-zinc-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFD43B] animate-pulse" />
              <span>Tableau de bord</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-tight">
              Bienvenue sur <span className="text-[#FFD43B]">Mercato</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Suivi en direct de vos ventes et de votre stock.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={onNewSale}
              className={`${canManage ? '' : 'col-span-2 '}flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#141418]/90 hover:bg-[#1E1E24] backdrop-blur-md text-white text-xs font-bold transition-all border border-white/[0.12] hover:border-[#FFD43B]/40 shadow-lg cursor-pointer group`}
            >
              <CreditCard size={15} className="text-[#FFD43B] group-hover:scale-110 transition-transform" />
              <span>Ouvrir Caisse</span>
            </button>
            {canManage && (
              <button
                onClick={onNewProduct}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD43B] hover:bg-[#F5C72B] text-[#0C0C0E] text-xs font-black shadow-lg shadow-[#FFD43B]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Ajouter Produit</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        <div
          className="col-span-2 lg:col-span-1 p-4 sm:p-6 rounded-3xl bg-[#FFF4BF]/70 border border-[#FFD43B]/50 shadow-[0_8px_30px_rgba(255,212,59,0.15)] flex flex-col justify-between min-w-0"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717] shadow-sm">
            <TrendingUp size={22} className="stroke-[2.5]" />
          </div>
          <div className="mt-3 sm:mt-5 min-w-0">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 truncate">Chiffre d'affaires</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#171717] tracking-tight mt-1 break-words">
              {formatCurrency(stats?.totals.revenue ?? 0)}
            </h3>
          </div>
        </div>

        <div
          className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between min-w-0"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#F6F6F3] flex items-center justify-center text-[#171717]">
            <ShoppingBag size={22} />
          </div>
          <div className="mt-3 sm:mt-5 min-w-0">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777] truncate">Ventes</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#171717] tracking-tight mt-1 break-words">
              {stats?.totals.salesCount ?? 0}
            </h3>
          </div>
        </div>

        <div
          className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between min-w-0"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#F6F6F3] flex items-center justify-center text-[#171717]">
              <Package size={22} />
            </div>
            {(stats?.totals.lowStockCount ?? 0) > 0 && (
              <span
                onClick={() => setActiveTab('stock')}
                title="Stock faible"
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100"
              >
                <AlertTriangle size={12} /> {stats?.totals.lowStockCount}
                <span className="hidden sm:inline">en stock faible</span>
              </span>
            )}
          </div>
          <div className="mt-3 sm:mt-5 min-w-0">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777] truncate">Produits Actifs</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#171717] tracking-tight mt-1 break-words">
              {stats?.totals.productsCount ?? 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)] min-w-0"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">Évolution des ventes</h2>
            <p className="text-xs text-[#777777] mt-1">Chiffre d'affaires et volume de ventes dans le temps.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
            <div className="bg-[#F6F6F3] p-1 rounded-2xl grid grid-cols-2 sm:flex items-center text-xs font-bold">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-2 sm:py-1.5 rounded-xl whitespace-nowrap transition-all ${chartMetric === 'revenue' ? 'bg-[#FFD43B] text-[#171717] shadow-xs' : 'text-stone-600 hover:text-[#171717]'}`}
              >
                Chiffre d'affaires
              </button>
              <button
                onClick={() => setChartMetric('salesCount')}
                className={`px-3 py-2 sm:py-1.5 rounded-xl whitespace-nowrap transition-all ${chartMetric === 'salesCount' ? 'bg-[#171717] text-white shadow-xs' : 'text-stone-600 hover:text-[#171717]'}`}
              >
                Nombre de ventes
              </button>
            </div>

            <div className="bg-[#F6F6F3] p-1 rounded-2xl grid grid-cols-3 sm:flex items-center text-xs font-bold">
              {(
                [
                  { id: 'day', label: 'Jour' },
                  { id: 'week', label: 'Semaine' },
                  { id: 'month', label: 'Mois' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPeriod(t.id)}
                  className={`px-3 py-2 sm:py-1.5 rounded-xl transition-all ${period === t.id ? 'bg-white text-[#171717] shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-56 sm:h-72 w-full min-w-0 overflow-hidden pt-2 sm:pt-4">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={stats?.series ?? []} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD43B" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#FFD43B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="bucket"
                stroke="#777777"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#F0F0EE' }}
                minTickGap={16}
                tickFormatter={(value) => formatBucketLabel(value, period)}
              />
              <YAxis
                stroke="#777777"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={44}
                allowDecimals={false}
                tickFormatter={(value) => compactNumber.format(value)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-[#171717] text-white p-3.5 rounded-2xl shadow-xl border border-black/20 text-xs min-w-[170px]">
                        <p className="font-bold text-[#FFD43B] mb-1">{formatBucketLabel(label, period)}</p>
                        <p className="flex justify-between gap-3 text-stone-300">
                          <span>Ventes :</span>
                          <span className="font-bold text-white">{formatCurrency(data.revenue)}</span>
                        </p>
                        <p className="flex justify-between gap-3 text-stone-400 mt-0.5 text-[10px]">
                          <span>Nombre :</span>
                          <span>{data.salesCount}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey={chartMetric} stroke="#FFD43B" strokeWidth={3} fillOpacity={1} fill="url(#yellowGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent sales + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div
          className="lg:col-span-2 p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <h2 className="text-lg font-extrabold text-[#171717] tracking-tight">Ventes récentes</h2>
            <button onClick={() => setActiveTab('sales')} className="text-xs font-bold text-[#171717] hover:underline flex items-center gap-1 group">
              <span>Voir tout</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {recentSales.length === 0 && <p className="text-xs text-stone-400 py-6 text-center">Aucune vente enregistrée.</p>}
            {recentSales.map((sale) => {
              const badge = getStatusBadge(sale.status)
              return (
                <div key={sale.id} onClick={() => onSelectSale(sale)} className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FBFBFA] -mx-2 px-2 rounded-xl transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#171717] font-mono">{sale.id.slice(0, 8)}</p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {new Date(sale.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3 shrink-0">
                    <span className="text-xs font-bold text-[#171717] whitespace-nowrap">{formatCurrency(sale.totalAmount)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badge.bg}`}>{badge.label}</span>
                    <Eye size={14} className="text-stone-300 hidden sm:block" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <AlertTriangle size={15} />
              </div>
              <h3 className="text-sm font-extrabold text-[#171717]">Alerte Réassort</h3>
            </div>
            <button onClick={() => setActiveTab('stock')} className="text-xs font-bold text-[#171717] hover:underline">
              Gérer
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 && <p className="text-xs text-stone-400">Aucune alerte de stock.</p>}
            {lowStockProducts.slice(0, 4).map((prod) => (
              <div key={prod.id} className="p-3 rounded-2xl bg-[#F6F6F3] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#171717] truncate">{prod.name}</p>
                  <p className="text-[11px] text-amber-700 font-semibold">Reste : {prod.stock?.quantity ?? 0} unités</p>
                </div>
                {canManage && (
                  <button
                    onClick={() => onReplenishProduct(prod)}
                    className="px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-[#FFD43B] text-[11px] font-bold text-[#171717] hover:text-[#171717] transition-colors shrink-0"
                  >
                    Réassort
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
