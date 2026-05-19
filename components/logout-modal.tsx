"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle>Keluar dari Akun?</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            Apakah Anda yakin ingin keluar dari akun Anda? Anda harus login
            kembali untuk mengakses dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="sm:order-1 bg-transparent"
          >
            Tidak
          </Button>
          <Button
            onClick={() => onConfirm()}
            disabled={isLoading}
            className="sm:order-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Memproses..." : "Ya, Keluar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
