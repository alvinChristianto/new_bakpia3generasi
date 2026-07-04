"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getPasswordError } from "@/components/auth-form";
import { resetPassword } from "@/app/api/endpoints/password-reset";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordError = getPasswordError(password);
  const confirmError =
    confirm !== password ? "Konfirmasi password tidak cocok" : "";
  const linkValid = Boolean(email && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (passwordError || confirmError) return;

    setIsLoading(true);
    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirm,
      });
      router.push("/login?reset=success");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Tautan tidak valid atau telah kedaluwarsa.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bakpia 3 Generasi
          </h1>
          <p className="text-muted-foreground">Istimewa</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Setel Password Baru
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Buat password baru untuk akun{" "}
            <span className="font-medium text-foreground">{email || "Anda"}</span>
            .
          </p>

          {!linkValid && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              Tautan tidak lengkap. Silakan minta tautan baru lewat halaman Lupa
              Password.
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(true)}
                  disabled={!linkValid}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition disabled:bg-muted disabled:cursor-not-allowed ${
                    touched && passwordError
                      ? "border-destructive"
                      : "border-border"
                  } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched && passwordError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Konfirmasi Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={!linkValid}
                className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition disabled:bg-muted disabled:cursor-not-allowed ${
                  touched && confirmError
                    ? "border-destructive"
                    : "border-border"
                } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                placeholder="Ulangi password baru"
              />
              {touched && confirmError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{confirmError}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !linkValid}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Password"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Kembali ke Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <ResetPasswordInner />
      </Suspense>
    </>
  );
}
