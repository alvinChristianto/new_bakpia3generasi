"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm, type RegisterData } from "@/components/auth-form";
import { Navbar } from "@/components/navbar";
import { signIn } from "next-auth/react"; // Pastikan import ini ada

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleConflict, setGoogleConflict] = useState(false);

  const handleRegister = async (data: RegisterData) => {
    setError(null);
    setGoogleConflict(false);
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name:         data.name,
            email:        data.email,
            phone_number: data.phone,
            password:     data.password,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        if (result.error_code === "google_account_exists") {
          setGoogleConflict(true);
        }
        throw new Error(result.message || "Pendaftaran gagal");
      }

      const loginResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (loginResult?.error) {
        router.push("/login?error=auto-login-failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
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
              Daftar Akun
            </h2>

            {googleConflict ? (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <p className="font-medium mb-1">Email sudah terdaftar via Google</p>
                <p className="mb-3">
                  Akun dengan email ini sudah dibuat menggunakan Google. Silakan
                  masuk dengan Google.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium bg-white hover:bg-amber-50 transition disabled:opacity-50"
                >
                  {isLoading ? "Memproses..." : "Masuk dengan Google"}
                </button>
              </div>
            ) : (
              error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )
            )}

            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

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
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Daftar dengan Google"}
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="#" className="text-primary hover:underline">
              Ketentuan Layanan
            </a>{" "}
            dan{" "}
            <a href="#" className="text-primary hover:underline">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
