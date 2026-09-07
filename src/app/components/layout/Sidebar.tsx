import React from 'react'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Boxes,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
} from 'lucide-react'
import { ActiveTab, UserRole } from '../../types'
import { useShop } from '../../context/ShopContext'

interface SidebarProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isOwner: boolean
  effectiveRole?: UserRole
  onOpenCreateStore: () => void
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isOwner,
  effectiveRole,
  onOpenCreateStore,
}: SidebarProps) {
  const { currentShop } = useShop()

  // A pure cashier only sells — the settings page (shop identity + team) has
  // nothing for them, so the nav item is skipped rather than leading to a
  // disabled/empty screen.
  const mainNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'products' as ActiveTab, label: 'Produits', icon: Package },
    { id: 'pos' as ActiveTab, label: 'Caisse', icon: CreditCard },
    { id: 'sales' as ActiveTab, label: 'Ventes', icon: ShoppingBag },
    { id: 'stock' as ActiveTab, label: 'Stock & Alertes', icon: Boxes },
    ...(effectiveRole !== 'CASHIER'
      ? [{ id: 'settings' as ActiveTab, label: 'Paramètres', icon: Settings }]
      : []),
  ]

  const activeStoreName = currentShop?.name || 'Aucune boutique'

  return (
    <motion.aside
      id="mercato-sidebar"
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex md:sticky md:top-0 md:h-screen shrink-0 z-40 bg-white border-r border-stone-200/80 flex-col justify-between select-none shadow-[2px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-20 px-4 flex items-center justify-between border-b border-stone-100 relative">
          <div
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 cursor-pointer group min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="relative w-10 h-10 rounded-2xl bg-[#FFD43B] flex items-center justify-center shadow-md shadow-[#FFD43B]/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <span className="text-[#171717] font-black text-xl tracking-tight">M</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#171717] border-2 border-white flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#FFD43B]" />
              </div>
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-[#171717] tracking-tight">Mercato</span>
                </div>
                <p className="text-[11px] text-stone-500 font-semibold truncate max-w-[140px]">
                  {activeStoreName}
                </p>
              </motion.div>
            )}
          </div>

          <button
            id="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex w-7 h-7 rounded-xl bg-[#F6F6F3] hover:bg-stone-200 text-stone-600 items-center justify-center transition-colors shrink-0 ${
              isCollapsed ? 'absolute -right-3.5 top-6.5 z-50 bg-white border border-stone-200 shadow-md hover:bg-[#FFD43B] hover:text-[#171717]' : ''
            }`}
            title={isCollapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="px-3 py-4 space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar">
          {!isCollapsed && (
            <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-wider text-stone-400">
              Menu Principal
            </div>
          )}

          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'
                } py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 relative group ${
                  isActive ? 'bg-[#171717] text-white shadow-sm' : 'text-[#171717] hover:bg-[#F6F6F3]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#FFD43B]' : 'text-stone-600'
                  }`}
                />
                {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Creator Box — only an owner can create a new shop */}
      <div className="p-3 border-t border-stone-100 bg-[#FBFBFA]">
        {!isCollapsed ? (
          <div className="space-y-2">
            {isOwner && (
              <button
                onClick={onOpenCreateStore}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#FFD43B] hover:brightness-105 text-[#171717] font-black text-xs shadow-md shadow-[#FFD43B]/20 transition-all"
              >
                <FolderPlus size={15} />
                <span>+ Nouvelle Boutique</span>
              </button>
            )}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 text-[10px] text-stone-500">
              <p className="font-extrabold text-[#171717] truncate">{activeStoreName}</p>
            </div>
          </div>
        ) : (
          isOwner && (
            <button
              onClick={onOpenCreateStore}
              className="w-full h-10 rounded-2xl bg-[#FFD43B] text-[#171717] flex items-center justify-center font-black shadow-xs hover:brightness-105 transition-all"
              title="Créer une nouvelle boutique"
            >
              <FolderPlus size={17} />
            </button>
          )
        )}
      </div>
    </motion.aside>
  )
}
