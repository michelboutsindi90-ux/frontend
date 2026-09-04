import { useCallback, useEffect, useState } from 'react'
import { Category, Product, ProductWithStock, StockItem } from '../types'
import * as categoriesClient from '../lib/resources/categories'
import * as productsClient from '../lib/resources/products'
import * as stockClient from '../lib/resources/stock'

export function useShopCatalog(shopId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!shopId) {
      setCategories([])
      setProducts([])
      setStockItems([])
      return
    }
    setIsLoading(true)
    try {
      const [cats, prods, stock] = await Promise.all([
        categoriesClient.listCategories(shopId),
        productsClient.listProducts(shopId),
        stockClient.listStock(shopId),
      ])
      setCategories(cats)
      setProducts(prods)
      setStockItems(stock)
    } finally {
      setIsLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const stockByProductId = new Map(stockItems.map((s) => [s.productId, s]))

  const productsWithStock: ProductWithStock[] = products.map((p) => ({
    ...p,
    category: categoryById.get(p.categoryId),
    stock: stockByProductId.get(p.id),
  }))

  return {
    categories,
    products,
    stockItems,
    productsWithStock,
    categoryById,
    isLoading,
    refetch,
  }
}
