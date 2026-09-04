import { useCallback, useEffect, useState } from 'react'
import { Sale } from '../types'
import * as salesClient from '../lib/resources/sales'

export function useShopSales(shopId: string | undefined) {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!shopId) {
      setSales([])
      return
    }
    setIsLoading(true)
    try {
      const list = await salesClient.listSales(shopId)
      setSales(list)
    } finally {
      setIsLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { sales, isLoading, refetch }
}
