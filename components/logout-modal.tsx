'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { AlertCircle } from 'lucide-react'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear user session/data here if needed
    localStorage.removeItem('bakpia-cart')
    // Redirect to home
    router.push('/')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle>Keluar dari Akun?</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            Apakah Anda yakin ingin keluar dari akun Anda? Anda harus login kembali untuk mengakses dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row">
          <Button
            onClick={onClose}
            variant="outline"
            className="sm:order-1 bg-transparent"
          >
            Batal
          </Button>
          <Button
            onClick={handleLogout}
            className="sm:order-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Keluar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
