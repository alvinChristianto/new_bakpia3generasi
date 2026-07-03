"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm, type LoginData } from "@/components/auth-form";
import { Navbar } from "@/components/navbar";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (data: LoginData) => {
    setError(null);
    setIsLoading(true);
    try {
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (loginResult?.error) {
        // A passwordless (Google-only) account must not be told "wrong password".
        if (loginResult.code === "oauth_only") {
          setError(
            'Akun ini masuk lewat Google. Lanjutkan dengan tombol "Masuk dengan Google" di bawah, atau setel password lewat "Lupa password?".',
          );
        } else {
          setError("Email atau password salah.");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // callbackUrl diarahkan ke dashboard setelah semua proses (termasuk Laravel) selesai
    await signIn("google", { callbackUrl: "/dashboard" });
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bakpia 3 Generasi
            </h1>
            <p className="text-muted-foreground">Istimewa</p>
          </div>

          {/* Form Container */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Masuk Akun
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            {/* Or Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">atau</span>
              </div>
            </div>

            {/* Social Login - Optional */}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Masuk dengan Google"}
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-primary hover:underline font-semibold"
            >
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
