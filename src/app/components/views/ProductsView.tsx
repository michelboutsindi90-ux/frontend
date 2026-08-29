import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Star,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react'
import { Product } from '../../types'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

type ProductSortOption = 'sales' | 'price_asc' | 'price_desc' | 'stock'

interface ProductsViewProps {
  products: Product[]
  onOpenAddModal: () => void
  onSelectProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
  onReplenishProduct: (product: Product) => void
}

export function ProductsView({
  products,
  onOpenAddModal,
  onSelectProduct,
  onDeleteProduct,
  onReplenishProduct,
}: ProductsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStockStatus, setSelectedStockStatus] = useState('all')
  const [sortBy, setSortBy] = useState<ProductSortOption>('sales')

  const categories = [
    'all',
    'Maroquinerie',
    'Cosmétique',
    'Épicerie Fine',
    'Mode & Textile',
    'Accessoires',
    'High-Tech',
    'Maison & Déco',
  ]

  // Filter products
  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory
      const matchStock = selectedStockStatus === 'all' || p.status === selectedStockStatus
      return matchSearch && matchCat && matchStock
    })
    .sort((a, b) => {
      if (sortBy === 'sales') return b.salesCount - a.salesCount
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'stock') return a.stock - b.stock
      return 0
    })

  return (
    <div id="products-view" className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
            Catalogue Produits
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Gérez vos stocks, vos prix, vos marges et la visibilité de vos articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-[#F6F6F3] p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#171717] shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Vue grille"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#171717] shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Vue tableau"
            >
              <List size={16} />
            </button>
          </div>

          {/* Add Product Button */}
          <motion.button
            id="add-product-btn"
            onClick={onOpenAddModal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Ajouter un produit</span>
          </motion.button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, SKU ou catégorie..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-medium text-[#171717] outline-none transition-all"
            />
          </div>

          {/* Stock Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="w-full md:w-44 px-3 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="all">Tous les stocks</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock faible</option>
            <option value="out_of_stock">Rupture</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
            className="w-full md:w-48 px-3 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="sales">Tri : Meilleures ventes</option>
            <option value="price_asc">Prix : Croissant</option>
            <option value="price_desc">Prix : Décroissant</option>
            <option value="stock">Stock : Plus bas en premier</option>
          </select>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const badge = getStatusBadge(product.status)
              const margin = product.price - product.costPrice

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#F6F6F3]">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Stock Status Badge */}
                      <span
                        className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold backdrop-blur-md border shadow-xs ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>

                      {/* Rating */}
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#171717] shadow-xs">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                        <span>{product.category}</span>
                        <span>SKU: {product.sku}</span>
                      </div>

                      <h3 className="font-extrabold text-sm text-[#171717] line-clamp-1 group-hover:text-stone-900">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex items-baseline justify-between">
                        <div>
                          <p className="text-xs text-stone-400">Prix de vente</p>
                          <p className="text-base font-black text-[#171717]">
                            {formatCurrency(product.price)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-stone-400">Stock</p>
                          <p
                            className={`text-xs font-black ${
                              product.stock <= product.alertThreshold
                                ? 'text-amber-700'
                                : 'text-[#171717]'
                            }`}
                          >
                            {product.stock} unités
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 border-t border-stone-100 bg-[#FBFBFA] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Marge +{formatCurrency(margin)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {product.stock <= product.alertThreshold && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onReplenishProduct(product)
                          }}
                          className="px-2 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-colors"
                          title="Réapprovisionner"
                        >
                          Réassort
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectProduct(product)
                        }}
                        className="p-1.5 rounded-xl bg-white border border-stone-200 hover:bg-[#FFD43B] text-stone-700 hover:text-[#171717] transition-colors"
                        title="Modifier / Détails"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-stone-100 bg-[#FBFBFA] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6 pr-4">Produit</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Prix Vente</th>
                  <th className="py-3.5 px-4">Marge</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const badge = getStatusBadge(p.status)
                  const margin = p.price - p.costPrice

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pl-6 pr-4">
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
                            <p className="text-[11px] text-stone-400 truncate">{p.supplier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium whitespace-nowrap">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171717] whitespace-nowrap">{formatCurrency(p.price)}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-bold whitespace-nowrap">
                        +{formatCurrency(margin)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171717] whitespace-nowrap">
                        <span
                          className={p.stock <= p.alertThreshold ? 'text-amber-700 font-black' : ''}
                        >
                          {p.stock} pcs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectProduct(p)
                            }}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-[#FFD43B] text-stone-700 hover:text-[#171717] transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteProduct(p.id)
                            }}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Search State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <Package size={40} className="mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-extrabold text-[#171717]">Aucun produit trouvé</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Aucun article ne correspond à votre recherche. Modifiez vos filtres ou ajoutez un nouveau produit.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30"
          >
            + Créer un produit
          </button>
        </div>
      )}
    </div>
  )
}
