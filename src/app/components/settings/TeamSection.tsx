import React, { useEffect, useState } from 'react'
import { Users, UserPlus, Trash2, KeyRound, Copy, Check } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { useShopRole } from '../../hooks/useShopRole'
import { ShopMember } from '../../types'
import * as membersClient from '../../lib/resources/members'
import { ApiError } from '../../lib/apiClient'

export function TeamSection() {
  const { currentShop } = useShop()
  const { isOwner, effectiveRole } = useShopRole()
  const canSeeTeam = isOwner || effectiveRole === 'MANAGER'
  const [members, setMembers] = useState<ShopMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'MANAGER' | 'CASHIER'>('CASHIER')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!currentShop || !canSeeTeam) return
    setIsLoading(true)
    membersClient
      .listMembers(currentShop.id)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setIsLoading(false))
  }, [currentShop, canSeeTeam])

  if (!currentShop || !canSeeTeam) return null

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteName.trim()) return
    setIsInviting(true)
    setErrorMessage(null)
    setCreatedCredentials(null)
    try {
      const result = await membersClient.addMember(currentShop.id, {
        email: inviteEmail.trim(),
        fullName: inviteName.trim(),
        role: inviteRole,
      })
      // addMember's response has no `user` relation populated — refetch for display
      const refreshed = await membersClient.listMembers(currentShop.id)
      setMembers(refreshed)
      if (result.temporaryPassword) {
        setCreatedCredentials({ email: inviteEmail.trim(), password: result.temporaryPassword })
      }
      setInviteName('')
      setInviteEmail('')
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Impossible d'ajouter ce membre.")
    } finally {
      setIsInviting(false)
    }
  }

  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const text = `Email : ${createdCredentials.email}\nMot de passe : ${createdCredentials.password}`
    navigator.clipboard?.writeText(text).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  const handleRoleChange = async (memberId: string, role: 'MANAGER' | 'CASHIER') => {
    // updateMember's response has no `user` relation populated — patch just the role locally
    await membersClient.updateMember(currentShop.id, memberId, role)
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)))
  }

  const handleRemove = async (memberId: string) => {
    await membersClient.removeMember(currentShop.id, memberId)
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-2xl bg-[#FFF4BF] text-[#171717] flex items-center justify-center">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#171717]">Équipe de la boutique</h2>
          <p className="text-xs text-stone-500">
            {isOwner
              ? 'Gérants et caissiers ayant accès à cette boutique'
              : 'Ajoutez ou retirez des caissiers pour cette boutique'}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {createdCredentials && (
        <div className="p-4 rounded-2xl bg-[#171717] text-white space-y-2">
          <div className="flex items-center gap-2 text-[#FFD43B]">
            <KeyRound size={15} />
            <p className="text-xs font-extrabold">Compte créé — transmettez ces identifiants</p>
          </div>
          <p className="text-xs text-stone-300">
            <span className="text-stone-400">Email : </span>
            {createdCredentials.email}
          </p>
          <p className="text-xs font-mono tracking-wide">
            <span className="text-stone-400 font-sans">Mot de passe : </span>
            {createdCredentials.password}
          </p>
          <button
            type="button"
            onClick={handleCopyCredentials}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-bold transition-colors"
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            <span>{isCopied ? 'Copié' : 'Copier'}</span>
          </button>
          <p className="text-[10px] text-stone-400 pt-1">
            Ce mot de passe ne sera plus jamais affiché — communiquez-le maintenant à la personne concernée.
          </p>
        </div>
      )}

      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-[#171717] mb-1.5">Nom complet</label>
          <input
            type="text"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="ex: Divine Mabiala"
            className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-[#171717] mb-1.5">Email du membre</label>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="collaborateur@email.com"
            className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-medium text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">Rôle</label>
          {isOwner ? (
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'MANAGER' | 'CASHIER')}
              className="px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none"
            >
              <option value="CASHIER">Caissier</option>
              <option value="MANAGER">Gérant</option>
            </select>
          ) : (
            <div className="px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-stone-500">
              Caissier
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isInviting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-bold text-xs hover:bg-[#F5C72B] transition-all disabled:opacity-60"
        >
          <UserPlus size={15} className="text-white" />
          <span>{isInviting ? 'Ajout...' : 'Ajouter'}</span>
        </button>
      </form>

      <div className="divide-y divide-stone-100">
        {isLoading && <p className="text-xs text-stone-400 py-3">Chargement de l'équipe...</p>}
        {!isLoading && members.length === 0 && (
          <p className="text-xs text-stone-400 py-3">Aucun membre pour l'instant.</p>
        )}
        {members.map((member) => {
          // A manager can only touch cashiers — peer managers are read-only for them.
          const canEditThisMember = isOwner || member.role === 'CASHIER'
          return (
            <div key={member.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#171717] truncate">
                  {member.user?.fullName || member.user?.email || member.userId}
                </p>
                <p className="text-[11px] text-stone-400 truncate">{member.user?.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isOwner ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as 'MANAGER' | 'CASHIER')}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none"
                  >
                    <option value="CASHIER">Caissier</option>
                    <option value="MANAGER">Gérant</option>
                  </select>
                ) : (
                  <span className="px-2.5 py-1.5 rounded-xl bg-[#F6F6F3] text-xs font-bold text-stone-500">
                    {member.role === 'MANAGER' ? 'Gérant' : 'Caissier'}
                  </span>
                )}
                {canEditThisMember && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Retirer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
