export type UserRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER'

export interface SafeUser {
  id: string
  email: string
  phone: string | null
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Shop {
  id: string
  name: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  zoneId?: string | null
  ownerId: string
  isActive: boolean
}

export interface ShopMember {
  id: string
  shopId: string
  userId: string
  role: UserRole
  user?: {
    id: string
    email: string
    fullName: string
  }
}

export interface Category {
  id: string
  name: string
  shopId: string
}

export interface Zone {
  id: string
  name: string
  description?: string | null
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  categoryId: string
  shopId: string
  isActive: boolean
}

export interface StockItem {
  id: string
  productId: string
  shopId: string
  quantity: number
  lowStockAlert: number
  version: number
}

export interface ProductWithStock extends Product {
  category?: Category
  stock?: StockItem
}

export type StockMovementType = 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN'

export interface StockMovement {
  id: string
  stockItemId: string
  type: StockMovementType
  quantity: number
  saleId?: string | null
  createdById: string
  createdAt: string
}

export type SaleStatus = 'DRAFT' | 'VALIDATED' | 'CANCELLED' | 'REFUNDED'

export interface SaleLine {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Sale {
  id: string
  shopId: string
  cashierId: string
  status: SaleStatus
  totalAmount: number
  idempotencyKey: string
  validatedAt?: string | null
  createdAt: string
  lines?: SaleLine[]
}

export interface ShopStatsTotals {
  salesCount: number
  revenue: number
  productsCount: number
  lowStockCount: number
}

export interface ShopStatsSeriesPoint {
  bucket: string
  salesCount: number
  revenue: number
}

export interface ShopStats {
  totals: ShopStatsTotals
  series: ShopStatsSeriesPoint[]
}

export type ActiveTab = 'dashboard' | 'products' | 'pos' | 'sales' | 'stock' | 'settings'
