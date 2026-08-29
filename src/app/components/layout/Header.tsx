import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  Bell,
  Plus,
  Store,
  ChevronDown,
  Command,
  ExternalLink,
  ShoppingBag,
  Package,
  CreditCard,
  User,
  LogOut,
  Sliders,
  Check,
  Building2,
  FolderPlus,
} from 'lucide-react'
import { ActiveTab, StoreConfig } from '../../types'

interface HeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  isCollapsed?: boolean
  storeName?: string
  storeConfig?: StoreConfig
  allStores?: StoreConfig[]
  onSwitchStore?: (store: StoreConfig) => void
  onOpenCreateStore?: () => void
  unreadNotifsCount?: number
  unreadCount?: number
  onOpenCommand?: () => void
  onOpenCommandPalette?: () => void
  onOpenNotifs?: () => void
  onOpenNotifications?: () => void
  onNewProduct?: () => void
  onOpenAddProduct?: () => void
  onNewSale?: () => void
  onOpenStorePreview?: () => void
  onOpenStorefront?: () => void
}

export function Header({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  storeName = 'Mercato Concept Store',
  storeConfig,
  allStores = [],
  onSwitchStore = () => {},
  onOpenCreateStore = () => {},
  unreadNotifsCount = 0,
  unreadCount = 0,
  onOpenCommand = () => {},
  onOpenCommandPalette,
  onOpenNotifs = () => {},
  onOpenNotifications,
  onNewProduct = () => {},
  onOpenAddProduct,
  onNewSale = () => {},
  onOpenStorePreview = () => {},
  onOpenStorefront,
}: HeaderProps) {
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleCommand = onOpenCommandPalette || onOpenCommand
  const handleNotifs = onOpenNotifications || onOpenNotifs
  const handleAddProd = onOpenAddProduct || onNewProduct
  const handleStorefront = onOpenStorefront || onOpenStorePreview
  const totalUnread = unreadCount || unreadNotifsCount

  const currentName = storeConfig?.name || storeName

  return (
    <header
      id="mercato-header"
      className="h-20 bg-white/90 backdrop-blur-md border-b border-stone-200/70 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all"
    >
      {/* Left section: Multi-Store Switcher & Global Search */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 max-w-xl">
        {/* Store Selector dropdown with Multi-Store SaaS options */}
        <div className="relative shrink-0">
          <button
            id="header-store-select-btn"
            onClick={() => setStoreMenuOpen(!storeMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200/80 transition-colors text-xs font-extrabold text-[#171717]"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
            <span className="truncate max-w-[110px] sm:max-w-[160px]">{currentName}</span>
            <ChevronDown size={14} className="text-[#777777] shrink-0" />
          </button>

          <AnimatePresence>
            {storeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-200 p-2.5 z-50 space-y-1"
              >
                <div className="px-3 py-2 flex items-center justify-between border-b border-stone-100 pb-2 mb-1">
                  <span className="text-[10px] font-extrabold text-[#777777] uppercase tracking-wider">
                    Boutiques SaaS Actives ({allStores.length})
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#FFF4BF] text-[#171717]">
                    Multi-Store
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {allStores.map((s) => {
                    const isSelected = storeConfig?.id === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSwitchStore(s)
                          setStoreMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-[#FFF4BF] text-[#171717] font-black shadow-xs'
                            : 'text-stone-700 hover:bg-[#F6F6F3]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold truncate">{s.name}</p>
                          <p className="text-[10px] text-stone-500 truncate">
                            {s.typeLabel || s.type} • {s.city || 'Abidjan'}
                          </p>
                        </div>
                        {isSelected && <Check size={14} className="text-[#171717] shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {/* Create New Store Action in Dropdown */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setStoreMenuOpen(false)
                      onOpenCreateStore()
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#171717] text-white hover:bg-stone-800 transition-all text-xs font-extrabold shadow-sm"
                  >
                    <FolderPlus size={14} className="text-[#FFD43B]" />
                    <span>+ Créer une nouvelle boutique</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search Bar */}
        <button
          id="header-global-search-btn"
          onClick={handleCommand}
          className="flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200/70 border border-stone-200/40 text-stone-500 hover:text-stone-800 transition-all flex-1 text-xs"
        >
          <Search size={15} className="text-[#777777] shrink-0" />
          <span className="truncate hidden sm:inline">Rechercher article, lot en gros, commande (Cmd + K)...</span>
          <span className="truncate sm:hidden">Rechercher...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-stone-500 shadow-2xs ml-auto">
            <Command size={10} /> K
          </kbd>
        </button>
      </div>

      {/* Right section: Live preview, Notifications, Yellow Action Button, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Storefront Trigger */}
        <button
          id="header-store-preview-btn"
          onClick={handleStorefront}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#171717] transition-all group"
          title="Aperçu de la boutique en ligne publique"
        >
          <Store size={15} className="text-[#777777] group-hover:text-[#171717]" />
          <span>Aperçu Client</span>
          <ExternalLink size={12} className="text-stone-400" />
        </button>

        {/* Notification Bell with animated counter */}
        <button
          id="header-notifications-btn"
          onClick={handleNotifs}
          className="relative w-10 h-10 rounded-2xl bg-[#F6F6F3] hover:bg-stone-200 text-[#171717] flex items-center justify-center transition-all"
          title="Notifications"
        >
          <Bell size={17} className="text-[#171717]" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFD43B] text-[#171717] font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
              {totalUnread}
            </span>
          )}
        </button>

        {/* Primary Yellow Action Button with Dropdown */}
        <div className="relative">
          <motion.button
            id="header-quick-action-btn"
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Créer / Action</span>
            <ChevronDown size={14} className="text-[#171717]" />
          </motion.button>

          <AnimatePresence>
            {quickActionOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-60 bg-white rounded-3xl shadow-xl border border-stone-200 p-2 z-50 space-y-1"
              >
                <button
                  id="action-add-product"
                  onClick={() => {
                    setQuickActionOpen(false)
                    handleAddProd()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                >
                  <Package size={16} className="text-[#171717]" />
                  <span>Nouveau produit / lot</span>
                </button>

                <button
                  id="action-new-store"
                  onClick={() => {
                    setQuickActionOpen(false)
                    onOpenCreateStore()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                >
                  <Store size={16} className="text-amber-600" />
                  <span>Nouvelle boutique SaaS</span>
                </button>

                <button
                  id="action-new-sale"
                  onClick={() => {
                    setQuickActionOpen(false)
                    setActiveTab('pos')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                >
                  <CreditCard size={16} className="text-[#171717]" />
                  <span>Encaissement caisse (POS)</span>
                </button>

                <button
                  id="action-new-order"
                  onClick={() => {
                    setQuickActionOpen(false)
                    setActiveTab('orders')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-800 hover:bg-[#FFF4BF] transition-colors"
                >
                  <ShoppingBag size={16} className="text-[#171717]" />
                  <span>Gérer les commandes</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            id="header-user-avatar-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-[#F6F6F3] transition-colors"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-9 h-9 rounded-2xl object-cover ring-2 ring-[#FFD43B]"
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-60 bg-white rounded-3xl shadow-xl border border-stone-200 p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="text-xs font-extrabold text-[#171717]">Kouamé Diallo</p>
                  <p className="text-[10px] text-[#777777]">kouame@mercatoboutique.com</p>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    onOpenCreateStore()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 my-1"
                >
                  <FolderPlus size={15} />
                  <span>Créer une boutique</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    setActiveTab('settings')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-[#F6F6F3]"
                >
                  <Sliders size={15} />
                  <span>Paramètres de boutique</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    setActiveTab('storefront')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-[#F6F6F3]"
                >
                  <Store size={15} className="text-stone-700" />
                  <span>Aperçu Boutique Client</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
