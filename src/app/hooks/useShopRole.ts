import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { listMembers } from '../lib/resources/members'
import { UserRole } from '../types'

interface ShopRole {
  isOwner: boolean
  effectiveRole: UserRole | undefined
  canManage: boolean
}

export function useShopRole(): ShopRole {
  const { user } = useAuth()
  const { currentShop } = useShop()
  const [memberRole, setMemberRole] = useState<UserRole | undefined>(undefined)

  const isOwner = !!user && !!currentShop && currentShop.ownerId === user.id

  useEffect(() => {
    setMemberRole(undefined)
    if (!user || !currentShop || isOwner) return
    let cancelled = false
    listMembers(currentShop.id)
      .then((members) => {
        if (cancelled) return
        const mine = members.find((m) => m.userId === user.id)
        setMemberRole(mine?.role)
      })
      .catch(() => {
        // best-effort UX gating only, backend remains the source of truth
      })
    return () => {
      cancelled = true
    }
  }, [user, currentShop, isOwner])

  const effectiveRole: UserRole | undefined = isOwner
    ? 'OWNER'
    : user?.role === 'ADMIN'
    ? 'ADMIN'
    : memberRole

  const canManage = effectiveRole === 'OWNER' || effectiveRole === 'ADMIN' || effectiveRole === 'MANAGER'

  return { isOwner, effectiveRole, canManage }
}
