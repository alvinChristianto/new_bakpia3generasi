'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm, type RegisterData } from '@/components/auth-form'
import { Navbar } from '@/components/navbar'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleRegister = async (data: RegisterData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Here you would typically make an API call to register the user
      console.log('Register data:', data)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      alert('Pendaftaran berhasil! Silakan login dengan akun Anda.')
      router.push('/login')
    } catch (err) {
      setError('Pendaftaran gagal. Silakan coba lagi.')
      console.error(err)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Bakpia Jogja</h1>
            <p className="text-muted-foreground">Istimewa</p>
          </div>

          {/* Form Container */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Daftar Akun
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <RegisterForm onSubmit={handleRegister}/>

            {/* Or Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">atau</span>
              </div>
            </div>

            {/* Social Register - Optional */}
            <button className="w-full px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition">
              Daftar dengan Google
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Dengan mendaftar, Anda menyetujui{' '}
            <a href="#" className="text-primary hover:underline">
              Ketentuan Layanan
            </a>
            {' '}dan{' '}
            <a href="#" className="text-primary hover:underline">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
