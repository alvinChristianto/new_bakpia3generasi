import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pembayaran Berhasil',
  robots: { index: false, follow: false },
}

export default function PaymentSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
