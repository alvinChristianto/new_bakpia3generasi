"use client";

import { useState } from "react";
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

    fetch(`${process.env.NEXT_PUBLIC_BE_ROUTE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => {
        if (!result.access_token) {
          throw new Error(result.message || "Login gagal");
        }
        // Simpan token di cookie melalui NextAuth
        signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        }).then((loginResult) => {
          if (loginResult?.error) {
            router.push("/login?error=auto-login-failed");
          } else {
            router.push("/dashboard");
          }
        });
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => setIsLoading(false));
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
              Bakpia Jogja
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

            <LoginForm onSubmit={handleLogin} />

            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-primary hover:underline">
                Lupa password?
              </a>
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
