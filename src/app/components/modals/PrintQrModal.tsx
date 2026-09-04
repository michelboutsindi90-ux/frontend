import React, { useState } from 'react'
import { X, Printer } from 'lucide-react'

interface PrintQrModalProps {
  isOpen: boolean
  onClose: () => void
  qrUrl: string | null
  productName: string
  sku: string
}

const SIZE_OPTIONS = [
  { id: 'sm', label: 'Petite (25 mm)', mm: 25 },
  { id: 'md', label: 'Moyenne (40 mm)', mm: 40 },
  { id: 'lg', label: 'Grande (60 mm)', mm: 60 },
]

export function PrintQrModal({ isOpen, onClose, qrUrl, productName, sku }: PrintQrModalProps) {
  const [sizeId, setSizeId] = useState('md')
  const [count, setCount] = useState(1)

  if (!isOpen) return null

  const handlePrint = () => {
    if (!qrUrl) return
    const size = SIZE_OPTIONS.find((s) => s.id === sizeId) ?? SIZE_OPTIONS[1]
    const printWindow = window.open('', '_blank', 'width=480,height=640')
    if (!printWindow) return

    const doc = printWindow.document
    doc.title = `QR - ${productName}`

    const style = doc.createElement('style')
    style.textContent = `
      @page { margin: 10mm; }
      body { font-family: sans-serif; margin: 0; padding: 0; }
      .sheet { display: flex; flex-wrap: wrap; gap: 4mm; align-content: flex-start; }
      .label { width: ${size.mm}mm; text-align: center; break-inside: avoid; page-break-inside: avoid; }
      .label img { width: 100%; height: ${size.mm}mm; object-fit: contain; }
      .label h2 { font-size: ${Math.max(8, Math.round(size.mm * 0.22))}px; margin: 2mm 0 0.5mm; line-height: 1.1; }
      .label p { font-size: ${Math.max(6, Math.round(size.mm * 0.16))}px; color: #555; margin: 0; }
    `
    doc.head.appendChild(style)

    const sheet = doc.createElement('div')
    sheet.className = 'sheet'
    for (let i = 0; i < count; i++) {
      const label = doc.createElement('div')
      label.className = 'label'

      const img = doc.createElement('img')
      img.src = qrUrl
      label.appendChild(img)

      const title = doc.createElement('h2')
      title.textContent = productName
      label.appendChild(title)

      const skuLine = doc.createElement('p')
      skuLine.textContent = `SKU: ${sku}`
      label.appendChild(skuLine)

      sheet.appendChild(label)
    }
    doc.body.appendChild(sheet)

    const images = Array.from(doc.images)
    const triggerPrint = () => {
      printWindow.focus()
      printWindow.print()
    }
    if (images.length === 0) {
      triggerPrint()
    } else {
      let loaded = 0
      images.forEach((img) => {
        if (img.complete) {
          loaded++
          if (loaded === images.length) triggerPrint()
        } else {
          img.onload = () => {
            loaded++
            if (loaded === images.length) triggerPrint()
          }
        }
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#171717]">Options d'impression</h2>
            <p className="text-xs text-[#777777]">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">Taille de l'étiquette</label>
          <select
            value={sizeId}
            onChange={(e) => setSizeId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-semibold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">Nombre à imprimer</label>
          <input
            type="number"
            min={1}
            max={60}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#F6F6F3] border border-stone-200 text-xs font-bold text-[#171717] outline-none focus:border-[#FFD43B] focus:bg-white"
          />
          <p className="text-[11px] text-stone-400 mt-1.5">
            Les étiquettes se répartissent automatiquement sur une ou plusieurs pages selon la taille choisie.
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={!qrUrl}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FFD43B] hover:brightness-105 text-[#171717] font-extrabold text-xs shadow-md shadow-[#FFD43B]/30 transition-all disabled:opacity-60"
        >
          <Printer size={15} />
          <span>Imprimer</span>
        </button>
      </div>
    </div>
  )
}
