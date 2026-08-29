import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  ArrowRight,
  Boxes,
  Sparkles,
  ChevronRight,
  Eye,
  Plus,
  CreditCard,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Product, Order, Customer, ActiveTab } from '../../types'
import { formatCurrency, formatNumber, getStatusBadge } from '../../utils/formatters'
import { salesEvolutionData } from '../../data/initialData'

interface DashboardViewProps {
  products: Product[]
  orders: Order[]
  customers: Customer[]
  setActiveTab: (tab: ActiveTab) => void
  onSelectOrder: (order: Order) => void
  onSelectProduct: (product: Product) => void
  onNewProduct: () => void
  onNewSale: () => void
  onReplenishProduct: (product: Product) => void
}

type Timeframe = 'today' | 'week' | 'month' | 'year'

export function DashboardView({
  products,
  orders,
  customers,
  setActiveTab,
  onSelectOrder,
  onSelectProduct,
  onNewProduct,
  onNewSale,
  onReplenishProduct,
}: DashboardViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('today')
  const [chartMetric, setChartMetric] = useState<'ventes' | 'benefice'>('ventes')

  const chartData = salesEvolutionData[timeframe]

  const lowStockProducts = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock')
  const topSellingProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4)

  return (
    <div id="dashboard-view" className="space-y-8 pb-16">
      {/* Top Greeting & Quick Actions Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#FFF4BF]/30 p-6 rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight">
              Bonjour, bienvenue sur Mercato 👋
            </h1>
          </div>
          <p className="text-sm text-[#777777] mt-1">
            Voici ce qui se passe dans votre boutique aujourd'hui.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dash-quick-pos"
            onClick={onNewSale}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#171717] hover:bg-black text-white text-xs font-bold transition-all shadow-sm group"
          >
            <CreditCard size={15} className="text-[#FFD43B]" />
            <span>Ouvrir Caisse</span>
          </button>

          <button
            id="dash-quick-add-prod"
            onClick={onNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] text-xs font-bold shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
          >
            <Plus size={16} />
            <span>Ajouter Produit</span>
          </button>
        </div>
      </motion.div>

      {/* 4 Big Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Chiffre d'affaires (Highlighted with light yellow background) */}
        <motion.div
          id="stat-card-revenue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 rounded-3xl bg-[#FFF4BF]/70 border border-[#FFD43B]/50 shadow-[0_8px_30px_rgba(255,212,59,0.15)] relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#FFD43B] flex items-center justify-center text-[#171717] shadow-sm">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              <ArrowUpRight size={13} /> +12,8 %
            </span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Chiffre d'affaires
            </p>
            <h3 className="text-2xl lg:text-3xl font-black text-[#171717] tracking-tight mt-1">
              2 845 000 FCFA
            </h3>
            <p className="text-[11px] text-stone-600 mt-1 font-medium">
              vs. 2 522 000 hier à la même heure
            </p>
          </div>

          {/* Mini Sparkline preview */}
          <div className="mt-4 pt-3 border-t border-[#FFD43B]/40 flex items-center justify-between text-xs text-[#171717] font-semibold">
            <span>Bénéfice estimé</span>
            <span className="font-extrabold">1 460 000 FCFA</span>
          </div>
        </motion.div>

        {/* Card 2: Commandes */}
        <motion.div
          id="stat-card-orders"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-stone-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#F6F6F3] flex items-center justify-center text-[#171717]">
              <ShoppingBag size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowUpRight size={13} /> +8,4 %
            </span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Commandes
            </p>
            <h3 className="text-2xl lg:text-3xl font-black text-[#171717] tracking-tight mt-1">
              248
            </h3>
            <p className="text-[11px] text-[#777777] mt-1">
              dont 18 en cours de préparation
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#777777]">
            <span>Panier moyen</span>
            <span className="font-bold text-[#171717]">11 470 FCFA</span>
          </div>
        </motion.div>

        {/* Card 3: Produits */}
        <motion.div
          id="stat-card-products"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-stone-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#F6F6F3] flex items-center justify-center text-[#171717]">
              <Package size={22} />
            </div>
            <span
              onClick={() => setActiveTab('stock')}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100"
            >
              <AlertTriangle size={12} /> 32 en stock faible
            </span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Produits Actifs
            </p>
            <h3 className="text-2xl lg:text-3xl font-black text-[#171717] tracking-tight mt-1">
              1 284
            </h3>
            <p className="text-[11px] text-[#777777] mt-1">
              répartis sur 8 collections
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#777777]">
            <span>Valeur stock</span>
            <span className="font-bold text-[#171717]">24 850 000 FCFA</span>
          </div>
        </motion.div>

        {/* Card 4: Clients */}
        <motion.div
          id="stat-card-customers"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-stone-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#F6F6F3] flex items-center justify-center text-[#171717]">
              <Users size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowUpRight size={13} /> +14,2 %
            </span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Clients Enregistrés
            </p>
            <h3 className="text-2xl lg:text-3xl font-black text-[#171717] tracking-tight mt-1">
              856
            </h3>
            <p className="text-[11px] text-[#777777] mt-1">
              Taux de rétention à 68,4 %
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#777777]">
            <span>Nouveaux ce mois</span>
            <span className="font-bold text-[#171717]">+118 clients</span>
          </div>
        </motion.div>
      </div>

      {/* Main Interactive Chart Section: "Évolution des ventes" */}
      <motion.div
        id="sales-evolution-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-[#171717] tracking-tight">
                Évolution des ventes
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FFF4BF] text-[#171717] border border-[#FFD43B]/40">
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-[#777777] mt-1">
              Analysez la dynamique de vos revenus et de vos marges nettes.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="bg-[#F6F6F3] p-1 rounded-2xl flex items-center text-xs font-bold">
              <button
                onClick={() => setChartMetric('ventes')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  chartMetric === 'ventes'
                    ? 'bg-[#FFD43B] text-[#171717] shadow-xs'
                    : 'text-stone-600 hover:text-[#171717]'
                }`}
              >
                Chiffre d'affaires
              </button>
              <button
                onClick={() => setChartMetric('benefice')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  chartMetric === 'benefice'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#171717]'
                }`}
              >
                Bénéfice net
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="bg-[#F6F6F3] p-1 rounded-2xl flex items-center text-xs font-bold">
              {(
                [
                  { id: 'today', label: "Aujourd'hui" },
                  { id: 'week', label: 'Cette semaine' },
                  { id: 'month', label: 'Ce mois' },
                  { id: 'year', label: 'Cette année' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    timeframe === t.id
                      ? 'bg-white text-[#171717] shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Elegant Recharts Curve */}
        <div className="h-72 w-full min-w-0 overflow-hidden pt-4">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD43B" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#FFD43B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="darkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#171717" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#777777"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#F0F0EE' }}
              />
              <YAxis
                stroke="#777777"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}k`)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-[#171717] text-white p-3.5 rounded-2xl shadow-xl border border-stone-800 text-xs min-w-[170px]">
                        <p className="font-bold text-[#FFD43B] mb-1">{label}</p>
                        <p className="flex justify-between gap-3 text-stone-300">
                          <span>Ventes :</span>
                          <span className="font-bold text-white">{formatCurrency(data.ventes)}</span>
                        </p>
                        <p className="flex justify-between gap-3 text-stone-300 mt-0.5">
                          <span>Bénéfice :</span>
                          <span className="font-bold text-emerald-400">{formatCurrency(data.benefice)}</span>
                        </p>
                        <p className="flex justify-between gap-3 text-stone-400 mt-0.5 text-[10px]">
                          <span>Commandes :</span>
                          <span>{data.commandes} cmds</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey={chartMetric}
                stroke={chartMetric === 'ventes' ? '#E5B810' : '#171717'}
                strokeWidth={3}
                fillOpacity={1}
                fill={chartMetric === 'ventes' ? 'url(#yellowGradient)' : 'url(#darkGradient)'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two Column Grid: Commandes Récentes + Quick Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes Récentes (2 cols on large screen) */}
        <motion.div
          id="recent-orders-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#171717] tracking-tight">
                Commandes récentes
              </h2>
              <p className="text-xs text-[#777777]">
                Dernières transactions enregistrées en ligne et en boutique.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-[#171717] hover:underline flex items-center gap-1 group"
            >
              <span>Voir tout</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-3 pr-4">N° Commande</th>
                  <th className="pb-3 px-4">Client</th>
                  <th className="pb-3 px-4 hidden sm:table-cell">Date</th>
                  <th className="pb-3 px-4">Montant</th>
                  <th className="pb-3 px-4">Statut</th>
                  <th className="pb-3 pl-4 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((order) => {
                  const badge = getStatusBadge(order.status)
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pl-3 pr-4 font-bold text-[#171717] whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={order.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={order.customerName}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <span className="font-semibold text-stone-800 truncate max-w-[140px]">
                            {order.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 hidden sm:table-cell whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171717] whitespace-nowrap">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 pr-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectOrder(order)
                          }}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-[#FFD43B] text-stone-700 hover:text-[#171717] transition-colors"
                          title="Voir le suivi de commande"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Widgets: Stock Alert & Top Sellers */}
        <div className="space-y-6">
          {/* Stock Alerts Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <AlertTriangle size={15} />
                </div>
                <h3 className="text-sm font-extrabold text-[#171717]">Alerte Réassort</h3>
              </div>
              <button
                onClick={() => setActiveTab('stock')}
                className="text-xs font-bold text-[#171717] hover:underline"
              >
                Gérer
              </button>
            </div>

            <div className="space-y-3">
              {lowStockProducts.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-2xl bg-[#F6F6F3] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#171717] truncate">{prod.name}</p>
                      <p className="text-[11px] text-amber-700 font-semibold">
                        Reste : {prod.stock} unités
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onReplenishProduct(prod)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-[#FFD43B] text-[11px] font-bold text-[#171717] transition-colors shrink-0"
                  >
                    Commander
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Sellers Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="p-6 rounded-3xl bg-[#171717] text-white shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#FFD43B]" />
                <h3 className="text-sm font-extrabold text-white">Top Ventes du Mois</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white/15 text-[#FFD43B]">
                Performance
              </span>
            </div>

            <div className="space-y-3">
              {topSellingProducts.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-[#FFD43B]">#{idx + 1}</span>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-400">{p.salesCount} vendus</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FFD43B] shrink-0">
                    {formatCurrency(p.price)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
