export interface WholesaleTier {
  minQty: number
  maxQty?: number
  unitPrice: number
  discountPercent: number
}

export interface Product {
  id: string
  name: string
  category: string
  price: number // in FCFA
  originalPrice?: number // for discount strikethrough (e.g. -40%)
  costPrice: number
  stock: number
  alertThreshold: number
  sku: string
  supplier: string
  description: string
  images: string[]
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  salesCount: number
  rating: number
  reviewCount?: number
  tags?: string[]
  storeId?: string
  // Wholesale & E-commerce features
  isFlashDeal?: boolean
  isChoice?: boolean
  isWholesale?: boolean
  moq?: number // Minimum Order Quantity
  wholesaleTiers?: WholesaleTier[]
  shippingBadge?: string
  verifiedSupplier?: boolean
  ordersLast30Days?: number
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'card' | 'cash' | 'wave' | 'orange_money'

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAvatar?: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  paymentStatus: 'paid' | 'pending' | 'failed'
  paymentMethod: PaymentMethod
  date: string
  shippingAddress: string
  notes?: string
  storeId?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  city: string
  tier: 'VIP' | 'Régulier' | 'Nouveau'
  ordersCount: number
  totalSpent: number
  lastOrderDate: string
  favoriteProducts: string[]
  notes: string
}

export interface Supplier {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  category: string
  leadTimeDays: number
  activeOrders: number
  rating: number
  verified?: boolean
  yearsInBusiness?: number
}

export interface StoreConfig {
  id: string
  name: string
  type: 'fashion' | 'electronics' | 'wholesale' | 'cosmetics' | 'food' | 'general'
  typeLabel?: string
  tagline: string
  slogan?: string
  description?: string
  slug?: string
  currency: string
  currencySymbol: string
  logoUrl?: string
  bannerUrl?: string
  accentColor: string
  announcement: string
  whatsappNumber: string
  phone: string
  email: string
  address: string
  city: string
  deliveryFee: number
  freeDeliveryThreshold: number
  theme: 'mercato_yellow' | 'emerald' | 'indigo' | 'coral' | 'obsidian'
  rating?: number
  positiveReviewsPercent?: number
  responseRate?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'order' | 'stock' | 'customer' | 'system'
  timestamp: string
  read: boolean
  linkView?: string
}

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'pos'
  | 'stock'
  | 'suppliers'
  | 'storefront'
  | 'analytics'
  | 'settings'
  | 'landing'
  | 'auth'
