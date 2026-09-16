import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  Plus,
  Store,
  ChevronDown,
  Command,
  Package,
  CreditCard,
  ShoppingBag,
  LogOut,
  Sliders,
  Check,
  FolderPlus,
} from 'lucide-react'
import { ActiveTab, UserRole } from '../../types'
import { useShop } from '../../context/ShopContext'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  canManage: boolean
  effectiveRole?: UserRole
  isOwner: boolean
  onOpenCreateStore: () => void
  onOpenCommandPalette: () => void
  onOpenAddProduct: () => void
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  OWNER: 'Propriétaire',
  MANAGER: 'Gérant',
  CASHIER: 'Caissier',
}

export function Header({
  activeTab,
  setActiveTab,
  canManage,
  effectiveRole,
  isOwner,
  onOpenCreateStore,
  onOpenCommandPalette,
  onOpenAddProduct,
}: HeaderProps) {
  const { shops, currentShop, setCurrentShop } = useShop()
  const { user, logout } = useAuth()
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const currentName = currentShop?.name || 'Sélectionner une boutique'

  return (
    <header
      id="mercato-header"
      className="h-[calc(4rem+env(safe-area-inset-top))] sm:h-20 pt-[env(safe-area-inset-top)] bg-white/90 backdrop-blur-md border-b border-stone-200/70 sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 transition-all"
    >
      {/* Left section: Multi-Store Switcher & Global Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 max-w-xl">
        <div className="relative min-w-0 shrink">
          <button
            id="header-store-select-btn"
            onClick={() => setStoreMenuOpen(!storeMenuOpen)}
            className="flex items-center gap-2 max-w-full px-3 py-2.5 sm:py-2 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200/80 transition-colors text-xs font-extrabold text-[#171717]"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentName}</span>
            <ChevronDown size={14} className="text-[#777777] shrink-0" />
          </button>

          <AnimatePresence>
            {storeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white rounded-3xl shadow-2xl border border-stone-200 p-2.5 z-50 space-y-1"
              >
                <div className="px-3 py-2 flex items-center justify-between border-b border-stone-100 pb-2 mb-1">
                  <span className="text-[10px] font-extrabold text-[#777777] uppercase tracking-wider">
                    Boutiques ({shops.length})
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {shops.map((s) => {
                    const isSelected = currentShop?.id === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setCurrentShop(s)
                          setStoreMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs text-left transition-all ${
                          isSelected ? 'bg-[#FFF4BF] text-[#171717] font-black shadow-xs' : 'text-stone-700 hover:bg-[#F6F6F3]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold truncate">{s.name}</p>
                          {s.address && <p className="text-[10px] text-stone-500 truncate">{s.address}</p>}
                        </div>
                        {isSelected && <Check size={14} className="text-[#171717] shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {isOwner && (
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setStoreMenuOpen(false)
                        onOpenCreateStore()
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#171717] text-white hover:bg-stone-800 transition-all text-xs font-extrabold shadow-sm"
                    >
                      <FolderPlus size={14} className="text-white" />
                      <span>+ Créer une nouvelle boutique</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          id="header-global-search-btn"
          onClick={onOpenCommandPalette}
          aria-label="Rechercher"
          className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 w-10 h-10 md:w-auto md:h-auto px-0 md:px-3.5 md:py-2.5 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200/70 border border-stone-200/40 text-stone-500 hover:text-stone-800 transition-all shrink-0 md:shrink md:flex-1 min-w-0 text-xs"
        >
          <Search size={15} className="text-[#777777] shrink-0" />
          <span className="truncate hidden md:inline">Rechercher un article ou une vente...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-stone-500 shadow-2xs ml-auto">
            <Command size={10} /> K
          </kbd>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="relative">
          <motion.button
            id="header-quick-action-btn"
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Créer / Action"
            className="flex items-center gap-1.5 sm:gap-2 h-10 px-3 sm:px-4 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span className="hidden lg:inline">Créer / Action</span>
            <ChevronDown size={14} className="text-[#171717] hidden sm:block" />
          </motion.button>

          <AnimatePresence>
            {quickActionOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-[min(15rem,calc(100vw-1.5rem))] bg-white rounded-3xl shadow-xl border border-stone-200 p-2 z-50 space-y-1"
              >
                {canManage && (
                  <button
                    onClick={() => {
                      setQuickActionOpen(false)
                      onOpenAddProduct()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                  >
                    <Package size={16} className="text-[#171717]" />
                    <span>Nouveau produit</span>
                  </button>
                )}

                {isOwner && (
                  <button
                    onClick={() => {
                      setQuickActionOpen(false)
                      onOpenCreateStore()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                  >
                    <Store size={16} className="text-amber-600" />
                    <span>Nouvelle boutique</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setQuickActionOpen(false)
                    setActiveTab('pos')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                >
                  <CreditCard size={16} className="text-[#171717]" />
                  <span>Encaissement (POS)</span>
                </button>

                <button
                  onClick={() => {
                    setQuickActionOpen(false)
                    setActiveTab('sales')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                >
                  <ShoppingBag size={16} className="text-[#171717]" />
                  <span>Historique des ventes</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            id="header-user-avatar-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-0.5 sm:px-2 sm:py-1.5 rounded-2xl hover:bg-[#F6F6F3] transition-colors"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#FFD43B] text-[#171717] flex items-center justify-center font-black text-sm ring-2 ring-[#FFD43B]">
              {(user?.fullName || '?').charAt(0).toUpperCase()}
            </div>
            {effectiveRole && (
              <span className="hidden xl:inline-block px-2 py-1 rounded-full bg-[#171717] text-white text-[10px] font-bold tracking-wide">
                {ROLE_LABELS[effectiveRole]}
              </span>
            )}
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-[min(15rem,calc(100vw-1.5rem))] bg-white rounded-3xl shadow-xl border border-stone-200 p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="text-xs font-extrabold text-[#171717] truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-[#777777] truncate">{user?.email}</p>
                  {effectiveRole && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#FFF4BF] text-[#171717] text-[10px] font-bold">
                      {ROLE_LABELS[effectiveRole]}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    setActiveTab('settings')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-stone-700 hover:bg-[#F6F6F3]"
                >
                  <Sliders size={15} />
                  <span>Paramètres de boutique</span>
                </button>

                <div className="h-px bg-stone-100 my-1" />

                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} className="text-red-500" />
                  <span>Se déconnecter</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
