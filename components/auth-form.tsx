'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface RegisterData {
  fullName: string
  email: string
  phone: string
  password: string
  agreedToTerms: boolean
}

export interface LoginData {
  email: string
  password: string
}

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => void
}

interface LoginFormProps {
  onSubmit: (data: LoginData) => void
}

// Validation helpers
const getFullNameError = (value: string): string => {
  if (!value.trim()) {
    return 'Nama lengkap harus diisi'
  }
  const alphabets = value.replace(/[^a-zA-Z]/g, '')
  if (alphabets.length < 3) {
    return 'Nama lengkap harus mengandung minimal 3 huruf'
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
    return 'Nama lengkap tidak boleh mengandung karakter spesial'
  }
  return ''
}

const getEmailError = (value: string): string => {
  if (!value.trim()) {
    return 'Email harus diisi'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Format email tidak valid (contoh: nama@email.com)'
  }
  return ''
}

const getPhoneError = (value: string): string => {
  if (!value.trim()) {
    return 'Nomor telepon harus diisi'
  }
  const phoneClean = value.replace(/[-\s]/g, '')
  if (!/^(\+62|08)[0-9]{9,11}$/.test(phoneClean)) {
    return 'Nomor telepon tidak valid (harus dimulai dengan +62 atau 08)'
  }
  return ''
}

const getPasswordError = (value: string): string => {
  if (!value.trim()) {
    return 'Password harus diisi'
  }
  if (value.length < 8) {
    return 'Password minimal 8 karakter'
  }
  return ''
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    agreedToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (field: keyof Omit<RegisterData, 'agreedToTerms'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhoneChange = (value: string) => {
    // Only allow digits, +, and hyphens
    const cleaned = value.replace(/[^\d+\-]/g, '')
    handleChange('phone', cleaned)
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreedToTerms: checked }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isFormValid = () => {
    return (
      getFullNameError(formData.fullName) === '' &&
      getEmailError(formData.email) === '' &&
      getPhoneError(formData.phone) === '' &&
      getPasswordError(formData.password) === '' &&
      formData.agreedToTerms
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      onSubmit(formData)
    } else {
      // Mark all fields as touched to show errors
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        password: true,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nama Lengkap *
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          onBlur={() => handleBlur('fullName')}
          className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
            touched.fullName && getFullNameError(formData.fullName) ? 'border-destructive' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/50`}
          placeholder="Masukkan nama lengkap"
        />
        {touched.fullName && getFullNameError(formData.fullName) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getFullNameError(formData.fullName)}</span>
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
            touched.email && getEmailError(formData.email) ? 'border-destructive' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/50`}
          placeholder="nama@email.com"
        />
        {touched.email && getEmailError(formData.email) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getEmailError(formData.email)}</span>
          </div>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nomor Telepon *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onBlur={() => handleBlur('phone')}
          className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
            touched.phone && getPhoneError(formData.phone) ? 'border-destructive' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/50`}
          placeholder="+62812345678 atau 08123456789"
        />
        {touched.phone && getPhoneError(formData.phone) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getPhoneError(formData.phone)}</span>
          </div>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition pr-10 ${
              touched.password && getPasswordError(formData.password) ? 'border-destructive' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary/50`}
            placeholder="Minimal 8 karakter"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {touched.password && getPasswordError(formData.password) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getPasswordError(formData.password)}</span>
          </div>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="terms"
          checked={formData.agreedToTerms}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-border bg-background cursor-pointer"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
          Saya setuju dengan{' '}
          <a href="#" className="text-primary hover:underline">
            ketentuan dan kebijakan privasi
          </a>
        </label>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid()}
        className={`w-full py-2 font-semibold transition ${
          isFormValid()
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        Daftar
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  )
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isFormValid = () => {
    return getEmailError(formData.email) === '' && getPasswordError(formData.password) === ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      onSubmit(formData)
    } else {
      setTouched({
        email: true,
        password: true,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
            touched.email && getEmailError(formData.email) ? 'border-destructive' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/50`}
          placeholder="nama@email.com"
        />
        {touched.email && getEmailError(formData.email) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getEmailError(formData.email)}</span>
          </div>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition pr-10 ${
              touched.password && getPasswordError(formData.password) ? 'border-destructive' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary/50`}
            placeholder="Masukkan password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {touched.password && getPasswordError(formData.password) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{getPasswordError(formData.password)}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isFormValid()}
        className={`w-full py-2 font-semibold transition ${
          isFormValid()
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        Masuk
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Daftar di sini
        </Link>
      </p>
    </form>
  )
}
