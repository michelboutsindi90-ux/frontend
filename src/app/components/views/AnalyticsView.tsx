import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
  Percent,
  Download,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Product, Order } from '../../types'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { salesEvolutionData } from '../../data/initialData'

interface AnalyticsViewProps {
  products: Product[]
  orders: Order[]
}

const categoryDistribution = [
  { name: 'Maroquinerie', value: 42, color: '#FFD43B' },
  { name: 'Cosmétique', value: 24, color: '#171717' },
  { name: 'Épicerie Fine', value: 16, color: '#E5B810' },
  { name: 'Mode & Textile', value: 12, color: '#777777' },
  { name: 'Autres', value: 6, color: '#D4D4D0' },
]

const monthlyComparison = [
  { month: 'Jan', anneeActuelle: 1850000, anneePrecedente: 1400000 },
  { month: 'Fév', anneeActuelle: 2100000, anneePrecedente: 1650000 },
  { month: 'Mar', anneeActuelle: 2450000, anneePrecedente: 1800000 },
  { month: 'Avr', anneeActuelle: 2600000, anneePrecedente: 2000000 },
  { month: 'Mai', anneeActuelle: 2845000, anneePrecedente: 2200000 },
]

export function AnalyticsView({ products, orders }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  return (
    <div id="analytics-view" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
            Analytique & Performances Financières
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Indicateurs clés de rentabilité, répartition par collection et croissance des revenus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F6F6F3] p-1 rounded-2xl flex items-center text-xs font-bold">
            {(
              [
                { id: 'month', label: 'Ce mois' },
                { id: 'quarter', label: 'Ce trimestre' },
                { id: 'year', label: 'Année 2026' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  period === p.id
                    ? 'bg-white text-[#171717] shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Rapport financier PDF exporté avec succès !')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#171717] hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download size={14} className="text-[#FFD43B]" />
            <span>Rapport PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
            Taux de Conversion
          </p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">4,82 %</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">+1,2% vs moyenne</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF4BF]/60 border border-[#FFD43B]/40 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
            Marge Bénéficiaire Nette
          </p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">51,3 %</h3>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">Rentabilité très saine</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
            Panier Moyen Client
          </p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">11 470 FCFA</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">+5,8% ce mois</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
            Revenu Récurrent (LTV)
          </p>
          <h3 className="text-2xl font-black text-[#171717] mt-1">42 800 FCFA</h3>
          <p className="text-[11px] text-stone-400 font-medium mt-1">Par client actif</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#171717]">
                Comparaison Annuelle des Ventes (FCFA)
              </h2>
              <p className="text-xs text-[#777777]">
                Croissance des revenus 2026 vs 2025 à période comparable.
              </p>
            </div>
          </div>

          <div className="h-72 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#777777" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#777777"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: number | string) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderRadius: '16px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="anneePrecedente"
                  name="2025"
                  fill="#D4D4D0"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="anneeActuelle"
                  name="2026 (Actuelle)"
                  fill="#FFD43B"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#171717]">Répartition par Catégorie</h2>
            <p className="text-xs text-[#777777]">Part du chiffre d'affaires total.</p>

            <div className="h-56 w-full min-w-0 overflow-hidden mt-2">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Part']}
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            {categoryDistribution.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-stone-700">{cat.name}</span>
                </div>
                <span className="font-extrabold text-[#171717]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
