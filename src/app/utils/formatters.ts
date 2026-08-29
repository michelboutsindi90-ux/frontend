export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount)
  return `${formatted} ${currency}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'paid':
    case 'delivered':
    case 'in_stock':
      return {
        label: status === 'paid' ? 'Payée' : status === 'delivered' ? 'Livrée' : 'En stock',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        dot: 'bg-emerald-500',
      }
    case 'pending':
    case 'preparing':
    case 'low_stock':
      return {
        label: status === 'pending' ? 'En attente' : status === 'preparing' ? 'Préparation' : 'Stock faible',
        bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
        dot: 'bg-amber-500',
      }
    case 'shipped':
      return {
        label: 'Expédiée',
        bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
        dot: 'bg-blue-500',
      }
    case 'cancelled':
    case 'out_of_stock':
    case 'failed':
      return {
        label: status === 'cancelled' ? 'Annulée' : status === 'out_of_stock' ? 'Rupture' : 'Échoué',
        bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
        dot: 'bg-rose-500',
      }
    default:
      return {
        label: status,
        bg: 'bg-stone-100 text-stone-700 border-stone-200',
        dot: 'bg-stone-400',
      }
  }
}
