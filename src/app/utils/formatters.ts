export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount)
  return `${formatted} ${currency}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export function getStockStatus(quantity: number, lowStockAlert: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock'
  if (quantity <= lowStockAlert) return 'low_stock'
  return 'in_stock'
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'VALIDATED':
    case 'in_stock':
      return {
        label: status === 'VALIDATED' ? 'Validée' : 'En stock',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        dot: 'bg-emerald-500',
      }
    case 'DRAFT':
    case 'low_stock':
      return {
        label: status === 'DRAFT' ? 'Brouillon' : 'Stock faible',
        bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
        dot: 'bg-amber-500',
      }
    case 'CANCELLED':
    case 'out_of_stock':
      return {
        label: status === 'CANCELLED' ? 'Annulée' : 'Rupture',
        bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
        dot: 'bg-rose-500',
      }
    case 'REFUNDED':
      return {
        label: 'Remboursée',
        bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
        dot: 'bg-blue-500',
      }
    default:
      return {
        label: status,
        bg: 'bg-stone-100 text-stone-700 border-stone-200',
        dot: 'bg-stone-400',
      }
  }
}
