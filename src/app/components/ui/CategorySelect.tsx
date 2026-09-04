import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Category } from '../../types'

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  onCreateCategory: (name: string) => Promise<Category>
}

export function CategorySelect({ categories, value, onChange, onCreateCategory }: CategorySelectProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setIsSubmitting(true)
    try {
      const created = await onCreateCategory(newName.trim())
      onChange(created.id)
      setNewName('')
      setIsCreating(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCreating) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouvelle catégorie..."
          className="flex-1 px-3 py-2.5 rounded-2xl bg-white border border-[#FFD43B] text-xs font-medium text-[#171717] outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreate()
            }
          }}
        />
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCreate}
          className="px-3 py-2.5 rounded-2xl bg-[#FFD43B] text-[#171717] text-xs font-bold disabled:opacity-60"
        >
          OK
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false)
            setNewName('')
          }}
          className="px-2.5 py-2.5 rounded-2xl bg-stone-100 text-stone-600 text-xs font-bold"
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === '__new__') {
          setIsCreating(true)
        } else {
          onChange(e.target.value)
        }
      }}
      className="w-full px-3 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200/80 text-xs text-[#171717] font-medium outline-none focus:border-[#FFD43B] focus:bg-white"
    >
      <option value="" disabled>
        Choisir une catégorie
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
      <option value="__new__">+ Nouvelle catégorie</option>
    </select>
  )
}
