import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { MobileBottomNav } from './components/layout/MobileBottomNav'
import { CommandPalette } from './components/layout/CommandPalette'
import { NotificationsDrawer } from './components/modals/NotificationsDrawer'

// Views
import { DashboardView } from './components/views/DashboardView'
import { ProductsView } from './components/views/ProductsView'
import { OrdersView } from './components/views/OrdersView'
import { ClientsView } from './components/views/ClientsView'
import { StockView } from './components/views/StockView'
import { AnalyticsView } from './components/views/AnalyticsView'
import { PosView } from './components/views/PosView'
import { StorefrontPreviewView } from './components/views/StorefrontPreviewView'
import { SettingsView } from './components/views/SettingsView'

// Modals
import { AddProductModal } from './components/modals/AddProductModal'
import { ProductDetailModal } from './components/modals/ProductDetailModal'
import { OrderDetailModal } from './components/modals/OrderDetailModal'
import { ClientDetailModal } from './components/modals/ClientDetailModal'
import { ReplenishModal } from './components/modals/ReplenishModal'
import { AuthModal } from './components/modals/AuthModal'
import { CreateStoreModal } from './components/modals/CreateStoreModal'

// Data & Types
import {
  initialProducts,
  initialOrders,
  initialCustomers,
  initialSuppliers,
  initialStores,
  initialStoreConfig,
  initialNotifications,
} from './data/initialData'
import {
  ActiveTab,
  Product,
  Order,
  Customer,
  Supplier,
  StoreConfig,
  NotificationItem,
  OrderStatus,
} from './types'

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // SaaS Multi-Store State
  const [stores, setStores] = useState<StoreConfig[]>(initialStores)
  const [currentStore, setCurrentStore] = useState<StoreConfig>(initialStores[0])

  // Data state
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [suppliers] = useState<Supplier[]>(initialSuppliers)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)

  // Modals & Drawers state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [replenishProduct, setReplenishProduct] = useState<Product | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // User Profile
  const [user, setUser] = useState({
    name: 'Kouamé Diallo',
    email: 'kouame@mercatoboutique.com',
    storeName: currentStore.name,
  })

  // Switch active store
  const handleSwitchStore = (newStore: StoreConfig) => {
    setCurrentStore(newStore)
    setUser((prev) => ({ ...prev, storeName: newStore.name }))

    // Push notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Boutique activée',
      message: `Vous êtes maintenant sur la boutique "${newStore.name}" (${newStore.typeLabel || newStore.type}).`,
      timestamp: 'À l’instant',
      type: 'system',
      read: false,
    }
    setNotifications([newNotif, ...notifications])
  }

  // Create new SaaS store
  const handleCreateStore = (newStore: StoreConfig, templateId: string) => {
    setStores([newStore, ...stores])
    setCurrentStore(newStore)
    setUser((prev) => ({ ...prev, storeName: newStore.name }))

    // Generate seeded template products for that specific store
    const storeProduct: Product = {
      id: `prod-seed-${Date.now()}`,
      storeId: newStore.id,
      name: `Pack Vedette ${newStore.typeLabel || 'Nouveauté'} Pro`,
      category: newStore.typeLabel || 'Général',
      price: 28500,
      originalPrice: 45000,
      costPrice: 13000,
      stock: 35,
      alertThreshold: 5,
      sku: `MERC-${newStore.slug?.toUpperCase().slice(0, 4) || 'STORE'}-001`,
      supplier: 'Fournisseur Certifié Or ⭐',
      description: `Article premium sélectionné pour ${newStore.name}. Qualité certifiée et livraison rapide.`,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'in_stock',
      salesCount: 120,
      ordersLast30Days: 45,
      rating: 5.0,
      reviewCount: 28,
      tags: ['Nouveauté', 'Prix Lancement', 'Boutique Récente'],
      isFlashDeal: true,
      isChoice: true,
      isWholesale: true,
      moq: 1,
      wholesaleTiers: [
        { minQty: 1, maxQty: 4, unitPrice: 28500, discountPercent: 0 },
        { minQty: 5, maxQty: 19, unitPrice: 23500, discountPercent: 17 },
        { minQty: 20, unitPrice: 19000, discountPercent: 33 },
      ],
      shippingBadge: 'Expédition sous 24h',
      verifiedSupplier: true,
    }

    setProducts([storeProduct, ...products])

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '🎉 Nouvelle boutique créée !',
      message: `La boutique "${newStore.name}" est prête et en ligne sur https://${newStore.slug}.mercatoboutique.com.`,
      timestamp: 'À l’instant',
      type: 'system',
      read: false,
    }
    setNotifications([newNotif, ...notifications])
  }

  // Handlers for Products
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'salesCount' | 'rating'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      storeId: currentStore.id,
      salesCount: 0,
      rating: 5.0,
    }
    setProducts([newProduct, ...products])

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Nouveau produit publié',
      message: `"${newProduct.name}" est maintenant actif dans votre catalogue.`,
      timestamp: 'À l’instant',
      type: 'stock',
      read: false,
    }
    setNotifications([newNotif, ...notifications])
  }

  const handleUpdateProduct = (updated: Product) => {
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated)
    }
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId))
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null)
    }
  }

  const handleConfirmReplenish = (productId: string, quantityToAdd: number) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const newStock = p.stock + quantityToAdd
          const newStatus = newStock <= p.alertThreshold ? 'low_stock' : 'in_stock'
          return { ...p, stock: newStock, status: newStatus }
        }
        return p
      })
    )

    const targetProd = products.find((p) => p.id === productId)
    if (targetProd) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Stock réapprovisionné',
        message: `+${quantityToAdd} unités ajoutées pour "${targetProd.name}".`,
        timestamp: 'À l’instant',
        type: 'stock',
        read: false,
      }
      setNotifications([newNotif, ...notifications])
    }
  }

  // Handlers for Orders
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const handleCompleteSale = (newOrderData: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...newOrderData,
      id: `ord-${Date.now()}`,
      storeId: currentStore.id,
    }
    setOrders([newOrder, ...orders])

    // Decrement stock for ordered items
    setProducts(
      products.map((p) => {
        const item = newOrderData.items.find((i) => i.productId === p.id)
        if (item) {
          const newStock = Math.max(0, p.stock - item.quantity)
          const newStatus =
            newStock === 0
              ? 'out_of_stock'
              : newStock <= p.alertThreshold
              ? 'low_stock'
              : 'in_stock'
          return {
            ...p,
            stock: newStock,
            salesCount: p.salesCount + item.quantity,
            status: newStatus,
          }
        }
        return p
      })
    )

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Nouvelle vente enregistrée',
      message: `Commande ${newOrder.orderNumber} enregistrée pour ${newOrder.totalAmount.toLocaleString()} FCFA.`,
      timestamp: 'À l’instant',
      type: 'order',
      read: false,
    }
    setNotifications([newNotif, ...notifications])
  }

  // Handlers for Customers
  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)))
    if (selectedCustomer && selectedCustomer.id === updated.id) {
      setSelectedCustomer(updated)
    }
  }

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([newCustomer, ...customers])
  }

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F6F6F3] text-[#171717] font-sans antialiased flex flex-col md:flex-row overflow-x-hidden">
      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        products={products}
        orders={orders}
        customers={customers}
        onNavigate={(tab) => {
          setActiveTab(tab)
          setIsCommandPaletteOpen(false)
        }}
        onSelectProduct={(prod) => {
          setSelectedProduct(prod)
          setIsCommandPaletteOpen(false)
        }}
        onSelectOrder={(ord) => {
          setSelectedOrder(ord)
          setIsCommandPaletteOpen(false)
        }}
        onSelectCustomer={(cust) => {
          setSelectedCustomer(cust)
          setIsCommandPaletteOpen(false)
        }}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onSelectNotification={(notif) => {
          if (notif.type === 'order') setActiveTab('orders')
          else if (notif.type === 'stock') setActiveTab('stock')
          else if (notif.type === 'customer') setActiveTab('customers')
          setIsNotificationsOpen(false)
        }}
      />

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        storeName={currentStore.name}
        currentStore={currentStore}
        allStores={stores}
        onOpenCreateStore={() => setIsCreateStoreOpen(true)}
        userName={user.name}
        userEmail={user.email}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 w-full min-h-screen overflow-x-hidden">
        {/* Top Minimalist Header */}
        <Header
          storeName={currentStore.name}
          storeConfig={currentStore}
          allStores={stores}
          onSwitchStore={handleSwitchStore}
          onOpenCreateStore={() => setIsCreateStoreOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          onOpenAddProduct={() => setIsAddProductOpen(true)}
          onOpenStorefront={() => setActiveTab('storefront')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* View Main Content Area with Fade Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + currentStore.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full min-w-0"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  products={products}
                  orders={orders}
                  customers={customers}
                  setActiveTab={setActiveTab}
                  onSelectOrder={(ord) => setSelectedOrder(ord)}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onNewProduct={() => setIsAddProductOpen(true)}
                  onNewSale={() => setActiveTab('pos')}
                  onReplenishProduct={(prod) => setReplenishProduct(prod)}
                />
              )}

              {activeTab === 'storefront' && (
                <StorefrontPreviewView
                  products={products}
                  storeConfig={currentStore}
                  allStores={stores}
                  onSwitchStore={handleSwitchStore}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView
                  products={products}
                  onOpenAddModal={() => setIsAddProductOpen(true)}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onDeleteProduct={handleDeleteProduct}
                  onReplenishProduct={(prod) => setReplenishProduct(prod)}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  onSelectOrder={(ord) => setSelectedOrder(ord)}
                />
              )}

              {activeTab === 'customers' && (
                <ClientsView
                  customers={customers}
                  onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                  onAddCustomer={handleAddCustomer}
                />
              )}

              {activeTab === 'stock' && (
                <StockView
                  products={products}
                  onReplenishProduct={(prod) => setReplenishProduct(prod)}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView products={products} orders={orders} />
              )}

              {activeTab === 'pos' && (
                <PosView
                  products={products}
                  onCompleteSale={handleCompleteSale}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  storeConfig={currentStore}
                  onUpdateStoreConfig={(updated) => {
                    setCurrentStore(updated)
                    setStores(stores.map((s) => (s.id === updated.id ? updated : s)))
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setIsCommandPaletteOpen(true)}
      />

      {/* Multi-Store Creator Modal */}
      <CreateStoreModal
        isOpen={isCreateStoreOpen}
        onClose={() => setIsCreateStoreOpen(false)}
        onCreateStore={handleCreateStore}
      />

      {/* Modals & Drawers */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
        suppliers={suppliers}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onReplenish={(prod) => {
          setSelectedProduct(null)
          setReplenishProduct(prod)
        }}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <ClientDetailModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        orders={orders}
        onUpdateCustomer={handleUpdateCustomer}
        onSelectOrder={(ord) => {
          setSelectedCustomer(null)
          setSelectedOrder(ord)
        }}
      />

      <ReplenishModal
        product={replenishProduct}
        isOpen={!!replenishProduct}
        onClose={() => setReplenishProduct(null)}
        onConfirmReplenish={handleConfirmReplenish}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLoginSuccess={(newUserData) => setUser(newUserData)}
      />
    </div>
  )
}
