import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  CreditCard,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  ShoppingBag,
  RotateCcw,
  Tag,
  User,
  Zap,
  Printer,
} from 'lucide-react'
import { Product, Order, OrderItem } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import confetti from 'canvas-confetti'

interface PosViewProps {
  products: Product[]
  onCompleteSale: (newOrder: Omit<Order, 'id'>) => void
}

interface CartItem extends OrderItem {
  maxStock: number
}

export function PosView({ products, onCompleteSale }: PosViewProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'card' | 'cash'>('wave')
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [customerName, setCustomerName] = useState('Client Caisse Boutique')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completedOrderNumber, setCompletedOrderNumber] = useState('')

  const categories = ['all', 'Maroquinerie', 'Cosmétique', 'Épicerie Fine', 'Mode & Textile', 'Accessoires']

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory
    return matchSearch && matchCat && p.stock > 0
  })

  const addToCart = (prod: Product) => {
    const existing = cart.find((item) => item.productId === prod.id)
    if (existing) {
      if (existing.quantity >= prod.stock) return
      setCart(
        cart.map((item) =>
          item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 1,
          image: prod.images[0],
          maxStock: prod.stock,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta
            if (nextQty <= 0) return null
            if (nextQty > item.maxStock) return item
            return { ...item, quantity: nextQty }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeItem = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const clearCart = () => setCart([])

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const totalAmount = subtotal - discountAmount

  const handleCheckout = () => {
    if (cart.length === 0) return

    const orderNum = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`
    setCompletedOrderNumber(orderNum)

    onCompleteSale({
      orderNumber: orderNum,
      customerName: customerName.trim() || 'Client Boutique',
      customerEmail: 'comptoir@mercatoboutique.com',
      customerPhone: '+225 07 00 00 00 00',
      date: "Aujourd'hui",
      totalAmount,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod,
      items: cart.map(({ maxStock, ...rest }) => rest),
      shippingAddress: 'Vente physique au comptoir : Mercato Boutique',
    })

    setShowSuccessModal(true)
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD43B', '#171717', '#FFF4BF'],
      })
    } catch (e) {}
  }

  const handleResetAfterSale = () => {
    setShowSuccessModal(false)
    clearCart()
    setDiscountPercent(0)
  }

  return (
    <div id="pos-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight flex items-center gap-2">
            <span>Terminal Caisse Enregistreuse</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              En Ligne
            </span>
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Saisie rapide des encaissements en boutique avec mise à jour instantanée du stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selection Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-[#777777]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un article pour encaissement..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F6F6F3] text-xs font-medium text-[#171717] outline-none focus:bg-white focus:border-[#FFD43B] border border-transparent"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === c
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#F6F6F3] text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c === 'all' ? 'Tout' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards for Fast Tap */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.productId === p.id)
              return (
                <motion.div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col justify-between relative shadow-2xs ${
                    inCart
                      ? 'border-[#FFD43B] ring-2 ring-[#FFD43B]/30'
                      : 'border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FFD43B] text-[#171717] font-black text-xs flex items-center justify-center shadow-xs">
                      {inCart.quantity}
                    </span>
                  )}
                  <div>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full aspect-square rounded-xl object-cover mb-2"
                    />
                    <p className="text-xs font-extrabold text-[#171717] line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">Stock: {p.stock}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-black text-[#171717]">
                      {formatCurrency(p.price)}
                    </span>
                    <button className="w-6 h-6 rounded-lg bg-[#FFF4BF] text-[#171717] flex items-center justify-center font-bold">
                      <Plus size={12} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right: Cart & Payment Checkout Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#171717]" />
                  <h3 className="font-extrabold text-sm text-[#171717]">
                    Panier Enregistré ({cart.reduce((a, b) => a + b.quantity, 0)})
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>Vider</span>
                  </button>
                )}
              </div>

              {/* Customer Name Input */}
              <div className="my-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F6F6F3] text-xs">
                <User size={14} className="text-stone-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nom du client au comptoir..."
                  className="w-full bg-transparent font-semibold text-[#171717] outline-none"
                />
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto my-2 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-stone-400">
                    <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">Le ticket est vide</p>
                    <p className="text-[11px] text-stone-400">Touchez un produit pour l'ajouter.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-2.5 rounded-2xl bg-[#FBFBFA] border border-stone-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#171717] truncate">{item.name}</p>
                          <p className="text-[10px] text-stone-400">{formatCurrency(item.price)}/u</p>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-black min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span className="text-xs font-black text-[#171717] min-w-[70px] text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Discount selection */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-600 flex items-center gap-1">
                    <Tag size={13} /> Remise commerciale :
                  </span>
                  <div className="flex gap-1">
                    {[0, 5, 10, 15].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiscountPercent(d)}
                        className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                          discountPercent === d
                            ? 'bg-[#171717] text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {d === 0 ? '0%' : `-${d}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector & Totals */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Sous-total HT</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Remise ({discountPercent}%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#171717] font-black text-lg pt-1">
                  <span>Total à Encaisser</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'wave', label: 'Wave' },
                    { id: 'orange_money', label: 'Orange' },
                    { id: 'card', label: 'Carte' },
                    { id: 'cash', label: 'Espèces' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#171717] text-[#FFD43B] border-[#171717] shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Validate Checkout Button */}
              <motion.button
                id="pos-checkout-btn"
                disabled={cart.length === 0}
                onClick={handleCheckout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-sm shadow-lg shadow-[#FFD43B]/40 hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={18} className="fill-[#171717]" />
                <span>Encaisser {formatCurrency(totalAmount)}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-2xl border border-stone-200 space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <Check size={32} className="stroke-[3]" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">Encaissement Réussi !</h2>
              <p className="text-xs text-stone-500 mt-1">
                La commande <strong>{completedOrderNumber}</strong> a été enregistrée et le stock a été mis à jour.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF4BF]/60 border border-[#FFD43B]/40 font-black text-xl text-[#171717]">
              {formatCurrency(totalAmount)}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-[#F6F6F3] text-stone-800 text-xs font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer size={15} />
                <span>Ticket de caisse</span>
              </button>
              <button
                onClick={handleResetAfterSale}
                className="flex-1 py-3 rounded-2xl bg-[#FFD43B] text-[#171717] text-xs font-extrabold shadow-md shadow-[#FFD43B]/30 hover:brightness-105 transition-all"
              >
                Nouvelle Vente
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
