import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daftar Akun',
  robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
