"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getProfile } from "@/app/api/endpoints/profile";
import { resendVerification } from "@/app/api/endpoints/email-verification";

/**
 * Informational nudge shown to a logged-in customer whose email is not yet
 * verified. Self-fetches verification status; renders nothing while loading or
 * when already verified. Verification never blocks checkout (informational only).
 */
export function VerifyEmailBanner() {
  const { data: session } = useSession();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    getProfile(token)
      .then((p) => setVerified(Boolean(p.email_verified_at)))
      .catch(() => {});
  }, [session?.accessToken]);

  // Hide while loading (null) or when verified (true).
  if (verified !== false) return null;

  const handleResend = async () => {
    const token = session?.accessToken;
    if (!token) return;
    setResending(true);
    try {
      await resendVerification(token);
      setResent(true);
    } catch {
      /* ignore */
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-2 flex-1">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Email belum diverifikasi
          </p>
          <p className="text-sm text-amber-700">
            Verifikasi email Anda untuk mengamankan akun. Periksa kotak masuk Anda.
          </p>
        </div>
      </div>
      {resent ? (
        <span className="flex items-center gap-1.5 text-sm text-green-700 shrink-0">
          <CheckCircle2 className="w-4 h-4" /> Email terkirim
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="shrink-0 px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium bg-background hover:bg-muted transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Ulang"
          )}
        </button>
      )}
    </div>
  );
}
