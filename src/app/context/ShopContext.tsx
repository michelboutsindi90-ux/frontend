import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Shop } from '../types'
import * as shopsClient from '../lib/resources/shops'
import { useAuth } from './AuthContext'

interface ShopContextValue {
  shops: Shop[]
  currentShop: Shop | null
  setCurrentShop: (shop: Shop) => void
  refreshShops: () => Promise<void>
  createShop: (dto: { name: string; address?: string; latitude?: number; longitude?: number }) => Promise<Shop>
  updateCurrentShop: (
    dto: Partial<{ name: string; address: string; latitude: number; longitude: number; isActive: boolean; zoneId: string }>
  ) => Promise<void>
  isLoading: boolean
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const [shops, setShops] = useState<Shop[]>([])
  const [currentShop, setCurrentShopState] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshShops = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await shopsClient.listShops()
      setShops(list)
      setCurrentShopState((prev) => {
        if (prev) {
          const stillExists = list.find((s) => s.id === prev.id)
          if (stillExists) return stillExists
        }
        return list[0] ?? null
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      refreshShops()
    } else if (status === 'unauthenticated') {
      setShops([])
      setCurrentShopState(null)
    }
  }, [status, refreshShops])

  const setCurrentShop = useCallback((shop: Shop) => {
    setCurrentShopState(shop)
  }, [])

  const createShop = useCallback(
    async (dto: { name: string; address?: string; latitude?: number; longitude?: number }) => {
      const newShop = await shopsClient.createShop(dto)
      setShops((prev) => [newShop, ...prev])
      setCurrentShopState(newShop)
      return newShop
    },
    []
  )

  const updateCurrentShop = useCallback(
    async (
      dto: Partial<{ name: string; address: string; latitude: number; longitude: number; isActive: boolean; zoneId: string }>
    ) => {
      if (!currentShop) return
      const updated = await shopsClient.updateShop(currentShop.id, dto)
      setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setCurrentShopState(updated)
    },
    [currentShop]
  )

  return (
    <ShopContext.Provider
      value={{ shops, currentShop, setCurrentShop, refreshShops, createShop, updateCurrentShop, isLoading }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within a ShopProvider')
  return ctx
}
