"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getEmailError } from "@/components/auth-form";
import { forgotPassword } from "@/app/api/endpoints/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = getEmailError(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (emailError) return;

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError("Gagal mengirim permintaan. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bakpia 3 Generasi
            </h1>
            <p className="text-muted-foreground">Istimewa</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {sent ? (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Periksa Email Anda
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Jika email terdaftar, kami telah mengirim tautan untuk menyetel
                  ulang password. Tautan berlaku selama 60 menit.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Kembali ke Masuk
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                  Lupa Password
                </h2>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Masukkan email Anda. Kami akan mengirim tautan untuk menyetel
                  ulang password. Masuk lewat Google? Tautan ini juga bisa dipakai
                  untuk menyetel password.
                </p>

                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition ${
                        touched && emailError
                          ? "border-destructive"
                          : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="nama@email.com"
                    />
                    {touched && emailError && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{emailError}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Kirim Tautan Reset"
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Ingat password Anda?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
