import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, X, CheckCheck, ShoppingBag, Boxes, Users, ArrowRight } from 'lucide-react'
import { NotificationItem, ActiveTab } from '../../types'

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAllAsRead: () => void
  onSelectNotification: (item: NotificationItem) => void
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}: NotificationsDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'order' | 'stock' | 'customer'>('all')

  if (!isOpen) return null

  const filteredNotifs = notifications.filter((n) =>
    filter === 'all' ? true : n.type === filter
  )

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={16} className="text-emerald-600" />
      case 'stock':
        return <Boxes size={16} className="text-amber-600" />
      case 'customer':
        return <Users size={16} className="text-blue-600" />
      default:
        return <Bell size={16} className="text-[#171717]" />
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white h-full shadow-2xl border-l border-stone-200 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF4BF] flex items-center justify-center text-[#171717]">
                <Bell size={16} />
              </div>
              <h3 className="font-extrabold text-base text-[#171717]">Centre de Notifications</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#F6F6F3] hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Ribbon & Filters */}
          <div className="px-5 py-3 border-b border-stone-100 bg-[#FBFBFA] flex items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {(['all', 'order', 'stock', 'customer'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    filter === t
                      ? 'bg-[#171717] text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {t === 'all'
                    ? 'Tous'
                    : t === 'order'
                    ? 'Commandes'
                    : t === 'stock'
                    ? 'Stock'
                    : 'Clients'}
                </button>
              ))}
            </div>

            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-[#171717] hover:underline flex items-center gap-1 shrink-0"
              title="Tout marquer comme lu"
            >
              <CheckCheck size={14} />
              <span>Tout lu</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold text-[#171717]">Aucune notification</p>
                <p className="text-xs text-stone-500">Tout est à jour dans votre boutique.</p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onSelectNotification(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:border-stone-300 hover:shadow-xs ${
                    n.read
                      ? 'bg-white border-stone-100'
                      : 'bg-[#FFF4BF]/30 border-[#FFD43B]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#171717] truncate">{n.title}</p>
                        <span className="text-[10px] text-stone-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
