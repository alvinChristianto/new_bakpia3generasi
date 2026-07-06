'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Loader2, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { getPhoneError, isPhoneValid } from '@/lib/phone-validation'

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
  /** When provided (locked/authenticated flow), shows a Save button beside the
   *  phone field that persists the number to the customer's profile. */
  onSavePhone?: (phone: string) => Promise<void>
  savingPhone?: boolean
  phoneSaved?: boolean
  /** Bumped by the parent whenever the user attempts to submit with invalid or
   *  incomplete data, so all field errors become visible even if untouched. */
  validationAttempt?: number
}

export function CheckoutForm({
  onDataChange,
  initialData,
  onValidationChange,
  locked = false,
  onSavePhone,
  savingPhone = false,
  phoneSaved = false,
  validationAttempt = 0,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CustomerData>(
    initialData || {
      namaPenerima: '',
      email: '',
      nomorTelepon: '',
    }
  )
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const isFirstValidationAttempt = useRef(true)

  useEffect(() => {
    if (!locked || !initialData) return
    setFormData(initialData)
    onDataChange(initialData)
  }, [locked, initialData, onDataChange])

  useEffect(() => {
    if (isFirstValidationAttempt.current) {
      isFirstValidationAttempt.current = false
      return
    }
    setTouched({ namaPenerima: true, email: true, nomorTelepon: true })
  }, [validationAttempt])

  const handleBlur = (field: keyof CustomerData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

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
      return getPhoneError(value)
    }
    return ''
  }

  const handleChange = (field: keyof CustomerData, value: string) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    onDataChange(updatedData)

    // Check overall form validity
    const updatedFormValid = field === 'namaPenerima'
      ? value.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        isPhoneValid(formData.nomorTelepon)
      : field === 'email'
      ? formData.namaPenerima.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
        isPhoneValid(formData.nomorTelepon)
      : formData.namaPenerima.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        isPhoneValid(value)

    if (onValidationChange) {
      onValidationChange(updatedFormValid)
    }
  }

  const inputClass = (field: keyof CustomerData) =>
    `w-full px-3 py-2 border rounded-lg text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
      locked
        ? 'bg-muted border-border cursor-not-allowed opacity-70'
        : touched[field] && getFieldError(field, formData[field])
        ? 'bg-background border-destructive'
        : 'bg-background border-border'
    }`

  // Phone stays editable even when the rest of the form is locked, so it gets
  // its own always-editable styling regardless of `locked`.
  const phoneInputClass =
    `w-full px-3 py-2 border rounded-lg text-foreground placeholder-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
      touched.nomorTelepon && getFieldError('nomorTelepon', formData.nomorTelepon)
        ? 'bg-background border-destructive'
        : 'bg-background border-border'
    }`

  const phoneValid = isPhoneValid(formData.nomorTelepon)

  const handleSavePhone = async () => {
    if (!onSavePhone) return
    const error = getFieldError('nomorTelepon', formData.nomorTelepon)
    if (error) {
      setTouched((prev) => ({ ...prev, nomorTelepon: true }))
      return
    }
    await onSavePhone(formData.nomorTelepon)
  }

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
          onBlur={() => handleBlur('namaPenerima')}
          disabled={locked}
          className={inputClass('namaPenerima')}
          placeholder="Masukkan nama penerima lengkap (minimal 3 huruf)"
        />
        {!locked && touched.namaPenerima && getFieldError('namaPenerima', formData.namaPenerima) && (
          <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getFieldError('namaPenerima', formData.namaPenerima)}</span>
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
          onBlur={() => handleBlur('email')}
          disabled={locked}
          className={inputClass('email')}
          placeholder="nama@email.com"
        />
        {!locked && touched.email && getFieldError('email', formData.email) && (
          <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getFieldError('email', formData.email)}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nomor Telepon *
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={formData.nomorTelepon}
            onChange={(e) => handleChange('nomorTelepon', e.target.value.replace(/[^\d+\-\s]/g, ''))}
            onBlur={() => handleBlur('nomorTelepon')}
            className={`flex-1 ${phoneInputClass}`}
            placeholder="+62812345678 atau 08123456789"
          />
          {onSavePhone && (
            <Button
              type="button"
              onClick={handleSavePhone}
              disabled={savingPhone || !phoneValid}
              className="h-auto shrink-0 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingPhone ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan
                </>
              ) : phoneSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Tersimpan
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          )}
        </div>
        {touched.nomorTelepon && getFieldError('nomorTelepon', formData.nomorTelepon) && (
          <div className="flex items-center gap-2 mt-1.5 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getFieldError('nomorTelepon', formData.nomorTelepon)}</span>
          </div>
        )}
        {onSavePhone && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Nomor telepon dapat diubah di sini, lalu tekan{' '}
            <span className="font-medium text-foreground">Simpan</span> untuk
            memperbarui profil Anda.
          </p>
        )}
      </div>
    </div>
  )
}
