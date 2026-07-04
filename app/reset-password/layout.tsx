import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setel Password | Bakpia 3 Generasi",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
