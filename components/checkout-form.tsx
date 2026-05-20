'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertCircle, Lock } from 'lucide-react'

export interface CustomerData {
  namaPenerima: string
  email: string
  nomorTelepon: string
}

interface CheckoutFormProps {
  onDataChange: (data: CustomerData) => void
  initialData?: CustomerData
  onValidationChange?: (isValid: boolean) => void
  locked?: boolean
}

export function CheckoutForm({ onDataChange, initialData, onValidationChange, locked = false }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CustomerData>(
    initialData || {
      namaPenerima: '',
      email: '',
      nomorTelepon: '',
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!locked || !initialData) return
    setFormData(initialData)
    onDataChange(initialData)
  }, [locked, initialData, onDataChange])

  const getFieldError = (field: keyof CustomerData, value: string): string => {
    if (field === 'namaPenerima') {
      if (!value.trim()) {
        return 'Nama penerima harus diisi'
      }
      // Check for min 3 alphabets (excluding spaces)
      const alphabets = value.replace(/[^a-zA-Z]/g, '')
      if (alphabets.length < 3) {
        return 'Nama penerima harus mengandung minimal 3 huruf'
      }
      // Check for special characters (allow only letters, numbers, and spaces)
      if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
        return 'Nama penerima tidak boleh mengandung karakter spesial'
      }
    }
    if (field === 'email') {
      if (!value.trim()) {
        return 'Email harus diisi'
      }
      // Regex validation for email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Format email tidak valid (contoh: nama@email.com)'
      }
    }
    if (field === 'nomorTelepon') {
      if (!value.trim()) {
        return 'Nomor telepon harus diisi'
      }
      // Phone validation: must start with +62 or 08
      const phoneClean = value.replace(/[-\s]/g, '')
      if (!/^(\+62|08)[0-9]{9,11}$/.test(phoneClean)) {
        return 'Nomor telepon tidak valid (harus dimulai dengan +62 atau 08)'
      }
    }
    return ''
  }

  const handleChange = (field: keyof CustomerData, value: string) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }

    // Validate on change
    const isValid = getFieldError(field, value)
    if (isValid) {
      onDataChange(updatedData)
    }

    // Check overall form validity
    const updatedFormValid = field === 'namaPenerima' 
      ? value.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        /^(\+62|0)[0-9]{9,12}$/.test(formData.nomorTelepon.replace(/[-\s]/g, ''))
      : field === 'email'
      ? formData.namaPenerima.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
        /^(\+62|0)[0-9]{9,12}$/.test(formData.nomorTelepon.replace(/[-\s]/g, ''))
      : formData.namaPenerima.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        /^(\+62|0)[0-9]{9,12}$/.test(value.replace(/[-\s]/g, ''))

    if (onValidationChange) {
      onValidationChange(updatedFormValid)
    }
  }

  const inputClass = (field: keyof CustomerData) =>
    `w-full px-3 py-2 border rounded-lg text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
      locked
        ? 'bg-muted border-border cursor-not-allowed opacity-70'
        : errors[field]
        ? 'bg-background border-destructive'
        : 'bg-background border-border'
    }`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Data Penerima</h3>
        {locked && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>
              Data dari akun Anda.{' '}
              <Link href="/dashboard/edit-profile" className="underline hover:text-foreground">
                Ubah di Profil
              </Link>
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nama Penerima *
        </label>
        <input
          type="text"
          value={formData.namaPenerima}
          onChange={(e) => !locked && handleChange('namaPenerima', e.target.value)}
          disabled={locked}
          className={inputClass('namaPenerima')}
          placeholder="Masukkan nama penerima lengkap (minimal 3 huruf)"
        />
        {!locked && errors.namaPenerima && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.namaPenerima}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => !locked && handleChange('email', e.target.value)}
          disabled={locked}
          className={inputClass('email')}
          placeholder="nama@email.com"
        />
        {!locked && errors.email && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nomor Telepon *
        </label>
        <input
          type="tel"
          value={formData.nomorTelepon}
          onChange={(e) => !locked && handleChange('nomorTelepon', e.target.value.replace(/[^\d+\-\s]/g, ''))}
          disabled={locked}
          className={inputClass('nomorTelepon')}
          placeholder="+62812345678 atau 08123456789"
        />
        {!locked && errors.nomorTelepon && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.nomorTelepon}</span>
          </div>
        )}
        {locked && !formData.nomorTelepon && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Nomor telepon belum diisi.{' '}
            <Link href="/dashboard/edit-profile" className="underline hover:text-foreground">
              Lengkapi di Profil
            </Link>{' '}
            sebelum checkout.
          </p>
        )}
      </div>
    </div>
  )
}
