import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, Plus, Search, LayoutGrid, List, Edit3, Trash2, Eye } from 'lucide-react'
import { Category, ProductWithStock } from '../../types'
import { formatCurrency, getStatusBadge, getStockStatus } from '../../utils/formatters'
import * as productsClient from '../../lib/resources/products'

type ProductSortOption = 'name' | 'price_asc' | 'price_desc' | 'stock'

interface ProductsViewProps {
  products: ProductWithStock[]
  categories: Category[]
  shopId: string
  canManage: boolean
  onOpenAddModal: () => void
  onSelectProduct: (product: ProductWithStock) => void
  onReplenishProduct: (product: ProductWithStock) => void
  onChanged: () => void
}

export function ProductsView({
  products,
  categories,
  shopId,
  canManage,
  onOpenAddModal,
  onSelectProduct,
  onReplenishProduct,
  onChanged,
}: ProductsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedStockStatus, setSelectedStockStatus] = useState('all')
  const [sortBy, setSortBy] = useState<ProductSortOption>('name')

  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId
      const status = getStockStatus(p.stock?.quantity ?? 0, p.stock?.lowStockAlert ?? 0)
      const matchStock = selectedStockStatus === 'all' || status === selectedStockStatus
      return matchSearch && matchCat && matchStock
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'stock') return (a.stock?.quantity ?? 0) - (b.stock?.quantity ?? 0)
      return 0
    })

  const handleDelete = async (id: string) => {
    await productsClient.deleteProduct(shopId, id)
    onChanged()
  }

  return (
    <div id="products-view" className="space-y-4 sm:space-y-6 pb-6 md:pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#171717] tracking-tight">Catalogue Produits</h1>
          <p className="text-xs text-[#777777] mt-0.5">Gérez vos articles, leur prix et leur catégorie.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-[#F6F6F3] p-1 rounded-2xl flex items-center shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Vue grille"
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#171717] shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Vue liste"
              className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-[#171717] shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <List size={16} />
            </button>
          </div>

          {canManage && (
            <motion.button
              id="add-product-btn"
              onClick={onOpenAddModal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Ajouter un produit</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 rounded-3xl bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-2 sm:gap-3">
          <div className="relative flex-1 w-full col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou SKU..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-medium text-[#171717] outline-none transition-all"
            />
          </div>

          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="w-full min-w-0 md:w-44 px-3 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="all">Tous les stocks</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock faible</option>
            <option value="out_of_stock">Rupture</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
            className="w-full min-w-0 md:w-48 px-3 py-2 rounded-2xl bg-[#F6F6F3] border border-transparent focus:border-[#FFD43B] focus:bg-white text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="name">Tri : Nom (A-Z)</option>
            <option value="price_asc">Prix : Croissant</option>
            <option value="price_desc">Prix : Décroissant</option>
            <option value="stock">Stock : Plus bas en premier</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              selectedCategoryId === 'all' ? 'bg-[#171717] text-white shadow-xs' : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                selectedCategoryId === cat.id ? 'bg-[#171717] text-white shadow-xs' : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'grid' && (
        <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.stock?.quantity ?? 0, product.stock?.lowStockAlert ?? 0)
              const badge = getStatusBadge(status)

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
                  className="min-w-0 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="p-3 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-2">
                      <span className="truncate max-w-full">{product.category?.name || '—'}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border whitespace-nowrap ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="w-full aspect-[16/9] sm:aspect-4/3 rounded-xl sm:rounded-2xl bg-[#F6F6F3] flex items-center justify-center mb-2 sm:mb-3">
                      <Package size={28} className="text-stone-300" />
                    </div>

                    <h3 className="font-extrabold text-xs sm:text-sm text-[#171717] line-clamp-1 group-hover:text-stone-900">{product.name}</h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 font-mono mt-0.5 truncate">SKU: {product.sku}</p>

                    <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-xs text-stone-400 hidden sm:block">Prix de vente</p>
                        <p className="text-sm sm:text-base font-black text-[#171717] truncate">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-stone-400 hidden sm:block">Stock</p>
                        <p className={`text-xs font-black ${status !== 'in_stock' ? 'text-amber-700' : 'text-[#171717]'}`}>
                          {product.stock?.quantity ?? 0} unités
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 sm:px-5 py-2 sm:py-3 border-t border-stone-100 bg-[#FBFBFA] flex items-center justify-end gap-1.5">
                    {status !== 'in_stock' && canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onReplenishProduct(product)
                        }}
                        className="px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-colors"
                      >
                        Réassort
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectProduct(product)
                      }}
                      aria-label="Modifier"
                      className="p-2 sm:p-1.5 rounded-xl bg-white border border-stone-200 hover:bg-[#FFD43B] text-stone-700 hover:text-[#171717] transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {viewMode === 'table' && filteredProducts.length > 0 && (
        <div className="md:hidden bg-white rounded-3xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden">
          {filteredProducts.map((p) => {
            const status = getStockStatus(p.stock?.quantity ?? 0, p.stock?.lowStockAlert ?? 0)
            const badge = getStatusBadge(status)
            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="p-3.5 flex items-center gap-3 active:bg-[#FBFBFA] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F6F6F3] flex items-center justify-center shrink-0">
                  <Package size={16} className="text-stone-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#171717] truncate">{p.name}</p>
                  <p className="text-[11px] text-stone-400 truncate">
                    {p.category?.name || '—'} · <span className="font-mono">{p.sku}</span>
                  </p>
                  <span className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                    <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-[#171717] whitespace-nowrap">{formatCurrency(p.price)}</p>
                  <p className={`text-[11px] font-bold whitespace-nowrap ${status !== 'in_stock' ? 'text-amber-700' : 'text-stone-500'}`}>
                    {p.stock?.quantity ?? 0} pcs
                  </p>
                </div>
                {canManage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(p.id)
                    }}
                    aria-label="Supprimer"
                    className="p-2 -mr-1 rounded-xl text-stone-400 hover:bg-rose-100 hover:text-rose-700 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="hidden md:block bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-stone-100 bg-[#FBFBFA] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6 pr-4">Produit</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Prix</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const status = getStockStatus(p.stock?.quantity ?? 0, p.stock?.lowStockAlert ?? 0)
                  const badge = getStatusBadge(status)

                  return (
                    <tr key={p.id} onClick={() => onSelectProduct(p)} className="hover:bg-[#FBFBFA] transition-colors cursor-pointer group">
                      <td className="py-3.5 pl-6 pr-4 font-bold text-[#171717] truncate max-w-[220px]">{p.name}</td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium whitespace-nowrap">{p.category?.name || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171717] whitespace-nowrap">{formatCurrency(p.price)}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171717] whitespace-nowrap">
                        <span className={status !== 'in_stock' ? 'text-amber-700 font-black' : ''}>{p.stock?.quantity ?? 0} pcs</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
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
                          {canManage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(p.id)
                              }}
                              className="p-1.5 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 sm:py-20 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8">
          <Package size={40} className="mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-extrabold text-[#171717]">Aucun produit trouvé</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Aucun article ne correspond à votre recherche. Modifiez vos filtres ou ajoutez un nouveau produit.
          </p>
          {canManage && (
            <button onClick={onOpenAddModal} className="mt-4 px-5 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs shadow-md shadow-[#FFD43B]/30">
              + Créer un produit
            </button>
          )}
        </div>
      )}
    </div>
  )
}
