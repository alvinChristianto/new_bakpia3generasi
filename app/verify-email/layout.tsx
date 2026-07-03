import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Email | Bakpia 3 Generasi",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
