import React, { useEffect, useState } from 'react'
import { Store, Save, CheckCircle2, MapPin, Power, Crosshair, ScanLine, Flag } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { useShopRole } from '../../hooks/useShopRole'
import { TeamSection } from '../settings/TeamSection'
import { ApiError } from '../../lib/apiClient'
import { Zone } from '../../types'
import * as zonesClient from '../../lib/resources/zones'

export function SettingsView() {
  const { currentShop, updateCurrentShop } = useShop()
  const { isOwner } = useShopRole()

  const [name, setName] = useState(currentShop?.name || '')
  const [address, setAddress] = useState(currentShop?.address || '')
  const [isActive, setIsActive] = useState(currentShop?.isActive ?? true)
  const [latitude, setLatitude] = useState<string>(currentShop?.latitude != null ? String(currentShop.latitude) : '')
  const [longitude, setLongitude] = useState<string>(currentShop?.longitude != null ? String(currentShop.longitude) : '')
  const [isLocating, setIsLocating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [zones, setZones] = useState<Zone[]>([])
  const [zoneId, setZoneId] = useState<string>(currentShop?.zoneId || '')
  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [isCreatingZoneSubmit, setIsCreatingZoneSubmit] = useState(false)

  useEffect(() => {
    zonesClient.listZones().then(setZones).catch(() => {})
  }, [])

  useEffect(() => {
    setZoneId(currentShop?.zoneId || '')
  }, [currentShop?.id, currentShop?.zoneId])

  const handleCreateZone = async () => {
    if (!newZoneName.trim()) return
    setIsCreatingZoneSubmit(true)
    try {
      const created = await zonesClient.createZone(newZoneName.trim())
      setZones((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setZoneId(created.id)
      setNewZoneName('')
      setIsCreatingZone(false)
    } finally {
      setIsCreatingZoneSubmit(false)
    }
  }

  if (!currentShop) {
    return (
      <div className="py-20 text-center text-stone-400 text-sm">Sélectionnez une boutique pour voir ses paramètres.</div>
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)
    try {
      await updateCurrentShop({
        name,
        address,
        isActive,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        zoneId: zoneId || undefined,
      })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Impossible d’enregistrer les modifications.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div id="settings-view" className="space-y-4 sm:space-y-6 pb-6 md:pb-16 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#171717] tracking-tight">Paramètres de la Boutique</h1>
        <p className="text-xs text-[#777777] mt-0.5">Identité de la boutique et gestion de l'équipe.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <fieldset disabled={!isOwner} className="space-y-6 disabled:opacity-60">
          <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF4BF] text-[#171717] flex items-center justify-center">
                <Store size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#171717]">Identité de la boutique</h2>
                <p className="text-xs text-stone-500">
                  {isOwner ? 'Nom et adresse de la boutique' : 'Seul le propriétaire peut modifier ces informations'}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Nom de la boutique *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Adresse</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#171717] flex items-center gap-1.5">
                  <ScanLine size={13} className="text-stone-400" />
                  Position GPS (pour la géolocalisation du scan QR)
                </label>
                <button
                  type="button"
                  disabled={isLocating}
                  onClick={() => {
                    if (!navigator.geolocation) return
                    setIsLocating(true)
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLatitude(String(pos.coords.latitude))
                        setLongitude(String(pos.coords.longitude))
                        setIsLocating(false)
                      },
                      () => setIsLocating(false),
                      { timeout: 5000 }
                    )
                  }}
                  className="text-[11px] font-bold text-[#171717] flex items-center gap-1 underline disabled:opacity-60"
                >
                  <Crosshair size={12} />
                  {isLocating ? 'Localisation...' : 'Utiliser ma position actuelle'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">
                Optionnel. Si renseignée, un scan de QR code trop éloigné de cette position sera refusé.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
                <Flag size={13} className="text-stone-400" />
                Zone géographique
              </label>
              {isCreatingZone ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="ex: Brazzaville Centre"
                    className="flex-1 px-3 py-2.5 rounded-2xl bg-white border border-[#FFD43B] text-xs font-medium text-[#171717] outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateZone()
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isCreatingZoneSubmit}
                    onClick={handleCreateZone}
                    className="px-3 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] text-xs font-bold disabled:opacity-60"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingZone(false)
                      setNewZoneName('')
                    }}
                    className="px-2.5 py-2.5 rounded-2xl bg-stone-100 text-stone-600 text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <select
                  value={zoneId}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setIsCreatingZone(true)
                    } else {
                      setZoneId(e.target.value)
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
                >
                  <option value="">Aucune zone</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                  <option value="__new__">+ Nouvelle zone</option>
                </select>
              )}
              <p className="text-[11px] text-stone-400 mt-1.5">
                Regroupement régional de la boutique (ex: quartier, ville). N'affecte pas le rayon de scan du QR code, défini par la position GPS ci-dessus.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Power size={16} className="text-stone-500" />
                <div>
                  <p className="font-extrabold text-xs text-[#171717]">Boutique active</p>
                  <p className="text-[11px] text-stone-400">Désactivez-la temporairement sans la supprimer</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 shrink-0 accent-[#FFD43B] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-2">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} /> Modifications enregistrées !
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#FFD43B] text-[#171717] font-black text-xs shadow-lg shadow-[#FFD43B]/40 hover:brightness-105 transition-all disabled:opacity-60"
            >
              <Save size={16} />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}</span>
            </button>
          </div>
        </fieldset>
      </form>

      <TeamSection />
    </div>
  )
}
