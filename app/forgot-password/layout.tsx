import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password | Bakpia 3 Generasi",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
