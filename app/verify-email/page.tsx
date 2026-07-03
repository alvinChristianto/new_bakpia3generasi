"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  resendVerification,
  verifyEmail,
} from "@/app/api/endpoints/email-verification";

type Status = "verifying" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!email || !token) {
      setStatus("error");
      return;
    }
    verifyEmail({ email, token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [email, token]);

  const handleResend = async () => {
    if (!session?.accessToken) return;
    setResending(true);
    try {
      await resendVerification(session.accessToken);
      setResent(true);
    } catch {
      setResent(false);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm text-center">
          {status === "verifying" && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Memverifikasi Email...
              </h2>
              <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Email Terverifikasi
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Terima kasih. Akun Anda kini aktif sepenuhnya.
              </p>
              <Link href="/dashboard">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Ke Dashboard
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Verifikasi Gagal
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tautan tidak valid atau telah kedaluwarsa (berlaku 24 jam).
              </p>

              {session?.accessToken ? (
                resent ? (
                  <p className="text-sm text-green-600">
                    Email verifikasi baru telah dikirim. Periksa kotak masuk Anda.
                  </p>
                ) : (
                  <Button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Ulang Email Verifikasi"
                    )}
                  </Button>
                )
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-border bg-transparent hover:bg-muted text-foreground"
                  >
                    Masuk untuk Kirim Ulang
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
        <VerifyEmailInner />
      </Suspense>
    </>
  );
}
