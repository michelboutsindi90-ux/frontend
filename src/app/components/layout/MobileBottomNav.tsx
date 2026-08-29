import React from 'react'
import { LayoutDashboard, Package, ShoppingBag, CreditCard, Boxes, Menu } from 'lucide-react'
import { ActiveTab } from '../../types'

interface MobileBottomNavProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  onOpenMobileMenu: () => void
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}: MobileBottomNavProps) {
  const items = [
    { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
    { id: 'products' as ActiveTab, label: 'Produits', icon: Package },
    { id: 'pos' as ActiveTab, label: 'Caisse', icon: CreditCard, highlight: true },
    { id: 'orders' as ActiveTab, label: 'Commandes', icon: ShoppingBag },
    { id: 'stock' as ActiveTab, label: 'Stock', icon: Boxes },
  ]

  return (
    <nav
      id="mobile-bottom-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        if (item.highlight) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFD43B] text-[#171717] flex items-center justify-center shadow-lg shadow-[#FFD43B]/40 ring-4 ring-white">
                <Icon size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-extrabold text-[#171717] mt-1">{item.label}</span>
            </button>
          )
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
              isActive ? 'text-[#171717] font-bold' : 'text-[#777777]'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-[#FFD43B]' : 'text-[#777777]'} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        )
      })}

      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center gap-1 py-1 px-2 text-[#777777]"
      >
        <Menu size={18} />
        <span className="text-[10px]">Plus</span>
      </button>
    </nav>
  )
}
