'use client'

import React from "react"

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProfileData {
  fullname: string
  email: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const EditProfilePage = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullname: 'Andi Kurniawan',
    email: 'andi@email.com',
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [successMessage, setSuccessMessage] = useState('')

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profileData.fullname.trim()) {
      newErrors.fullname = 'Nama lengkap harus diisi'
    } else {
      const alphabets = profileData.fullname.replace(/[^a-zA-Z]/g, '')
      if (alphabets.length < 3) {
        newErrors.fullname = 'Nama lengkap harus mengandung minimal 3 huruf'
      }
      if (!/^[a-zA-Z0-9\s]+$/.test(profileData.fullname)) {
        newErrors.fullname = 'Nama lengkap tidak boleh mengandung karakter spesial'
      }
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini harus diisi'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password baru harus diisi'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password baru minimal 8 karakter'
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi'
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateProfile()) {
      setSuccessMessage('Profile berhasil diperbarui!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePassword()) {
      setSuccessMessage('Password berhasil diubah!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 pt-20 md:pt-4">
          <div className="max-w-2xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <User className="w-8 h-8" />
                Edit Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Kelola informasi akun Anda
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
                {successMessage}
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="profile" className="data-[state=active]:bg-card">
                  Profil
                </TabsTrigger>
                <TabsTrigger value="password" className="data-[state=active]:bg-card">
                  Password
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <form onSubmit={handleProfileSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
                  {/* Fullname Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={profileData.fullname}
                      onChange={(e) => {
                        setProfileData({ ...profileData, fullname: e.target.value })
                        if (errors.fullname) setErrors({ ...errors, fullname: '' })
                      }}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                        errors.fullname ? 'border-destructive' : 'border-border'
                      } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.fullname && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.fullname}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData({ ...profileData, email: e.target.value })
                          if (errors.email) setErrors({ ...errors, email: '' })
                        }}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.email ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Simpan Perubahan
                  </Button>
                </form>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password" className="space-y-6">
                <form onSubmit={handlePasswordSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password Saat Ini *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' })
                        }}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.currentPassword ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password Baru *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                          if (errors.newPassword) setErrors({ ...errors, newPassword: '' })
                        }}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.newPassword ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="Masukkan password baru (minimal 8 karakter)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.newPassword}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Konfirmasi Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                        }}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground transition ${
                          errors.confirmPassword ? 'border-destructive' : 'border-border'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Ubah Password
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default EditProfilePage
