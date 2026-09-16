import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { MobileBottomNav } from './components/layout/MobileBottomNav'
import { CommandPalette } from './components/layout/CommandPalette'

import { DashboardView } from './components/views/DashboardView'
import { ProductsView } from './components/views/ProductsView'
import { SalesView } from './components/views/SalesView'
import { StockView } from './components/views/StockView'
import { PosView } from './components/views/PosView'
import { SettingsView } from './components/views/SettingsView'
import { AuthView } from './components/views/AuthView'

import { AddProductModal } from './components/modals/AddProductModal'
import { ProductDetailModal } from './components/modals/ProductDetailModal'
import { SaleDetailModal } from './components/modals/SaleDetailModal'
import { ReplenishModal } from './components/modals/ReplenishModal'
import { CreateStoreModal } from './components/modals/CreateStoreModal'
import { InstallPwaPrompt } from './components/ui/InstallPwaPrompt'

import { useAuth } from './context/AuthContext'
import { useShop } from './context/ShopContext'
import { useShopRole } from './hooks/useShopRole'
import { useShopCatalog } from './hooks/useShopCatalog'
import { useShopSales } from './hooks/useShopSales'
import { ActiveTab, ProductWithStock, Sale } from './types'
import { FolderPlus, Loader2 } from 'lucide-react'

function AppShell() {
  const { currentShop } = useShop()
  const { canManage, effectiveRole, isOwner } = useShopRole()
  const { categories, productsWithStock, refetch: refetchCatalog } = useShopCatalog(currentShop?.id)
  const { sales, refetch: refetchSales } = useShopSales(currentShop?.id)

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  // Below xl the full-width sidebar eats too much of the content area (tablets,
  // small laptops), so it starts collapsed there.
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1280
  )

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [replenishProduct, setReplenishProduct] = useState<ProductWithStock | null>(null)

  if (!currentShop) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-[#F6F6F3] p-4 sm:p-6">
        <div className="max-w-sm w-full text-center bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD43B] text-[#171717] flex items-center justify-center mx-auto shadow-md">
            <FolderPlus size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-[#171717]">Créez votre première boutique</h2>
          <p className="text-xs text-stone-500">Vous n'avez pas encore de boutique. Créez-en une pour commencer à gérer vos produits et vos ventes.</p>
          <button
            onClick={() => setIsCreateStoreOpen(true)}
            className="w-full py-3 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
          >
            + Créer une boutique
          </button>
        </div>
        <CreateStoreModal isOpen={isCreateStoreOpen} onClose={() => setIsCreateStoreOpen(false)} />
      </div>
    )
  }

  const handleSaleCompleted = () => {
    refetchCatalog()
    refetchSales()
  }

  return (
    <div className="min-h-dvh w-full max-w-full bg-[#F6F6F3] text-[#171717] font-sans antialiased flex flex-col md:flex-row">
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        products={productsWithStock}
        sales={sales}
        onNavigate={(tab) => {
          setActiveTab(tab)
          setIsCommandPaletteOpen(false)
        }}
        onSelectProduct={(prod) => {
          setSelectedProduct(prod)
          setIsCommandPaletteOpen(false)
        }}
        onSelectSale={(sale) => {
          setSelectedSale(sale)
          setIsCommandPaletteOpen(false)
        }}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOwner={isOwner}
        effectiveRole={effectiveRole}
        onOpenCreateStore={() => setIsCreateStoreOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full min-h-dvh">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          canManage={canManage}
          effectiveRole={effectiveRole}
          isOwner={isOwner}
          onOpenCreateStore={() => setIsCreateStoreOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAddProduct={() => setIsAddProductOpen(true)}
        />

        <main className="flex-1 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 md:pb-8 lg:p-8 w-full min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + currentShop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full min-w-0"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  shopId={currentShop.id}
                  products={productsWithStock}
                  sales={sales}
                  canManage={canManage}
                  setActiveTab={setActiveTab}
                  onSelectSale={(sale) => setSelectedSale(sale)}
                  onNewProduct={() => setIsAddProductOpen(true)}
                  onNewSale={() => setActiveTab('pos')}
                  onReplenishProduct={(prod) => setReplenishProduct(prod)}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView
                  products={productsWithStock}
                  categories={categories}
                  shopId={currentShop.id}
                  canManage={canManage}
                  onOpenAddModal={() => setIsAddProductOpen(true)}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onReplenishProduct={(prod) => setReplenishProduct(prod)}
                  onChanged={refetchCatalog}
                />
              )}

              {activeTab === 'stock' && (
                <StockView
                  products={productsWithStock}
                  canManage={canManage}
                  onReplenishProduct={(prod) => setReplenishProduct(prod)}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                />
              )}

              {activeTab === 'pos' && (
                <PosView
                  products={productsWithStock}
                  categories={categories}
                  shopId={currentShop.id}
                  onSaleCompleted={handleSaleCompleted}
                  onOpenProducts={() => setActiveTab('products')}
                />
              )}

              {activeTab === 'sales' && (
                <SalesView sales={sales} onSelectSale={(sale) => setSelectedSale(sale)} />
              )}

              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} onOpenMobileMenu={() => setIsCommandPaletteOpen(true)} />

      <CreateStoreModal isOpen={isCreateStoreOpen} onClose={() => setIsCreateStoreOpen(false)} />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        shopId={currentShop.id}
        categories={categories}
        onCategoryCreated={() => refetchCatalog()}
        onCreated={refetchCatalog}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        shopId={currentShop.id}
        categories={categories}
        canManage={canManage}
        onUpdated={() => {
          refetchCatalog()
          setSelectedProduct(null)
        }}
        onDeleted={() => {
          refetchCatalog()
          setSelectedProduct(null)
        }}
        onReplenish={(prod) => {
          setSelectedProduct(null)
          setReplenishProduct(prod)
        }}
      />

      <SaleDetailModal
        sale={selectedSale}
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        shopId={currentShop.id}
        products={productsWithStock}
        canManage={canManage}
        onChanged={() => {
          refetchSales()
          refetchCatalog()
        }}
      />

      <ReplenishModal
        product={replenishProduct}
        isOpen={!!replenishProduct}
        onClose={() => setReplenishProduct(null)}
        shopId={currentShop.id}
        onAdjusted={refetchCatalog}
      />
    </div>
  )
}

export default function App() {
  const { status } = useAuth()

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-[#F6F6F3]">
        <Loader2 size={28} className="animate-spin text-[#FFD43B]" />
      </div>
    )
  }

  return (
    <>
      {status === 'unauthenticated' ? <AuthView /> : <AppShell />}
      <InstallPwaPrompt />
    </>
  )
}
