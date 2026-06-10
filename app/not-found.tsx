import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Home, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
  description: 'Halaman yang Anda cari tidak ada. Kembali ke beranda untuk menelusuri produk kami.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex items-center px-4">
        <div className="max-w-2xl mx-auto w-full text-center py-20">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-block">
              <div className="text-7xl md:text-9xl font-bold text-primary/20 mb-2">
                404
              </div>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. Mari kita bawa Anda kembali ke halaman utama.
          </p>

          {/* Search Section */}
          <div className="mb-8 bg-muted border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <p className="text-muted-foreground">
                Cari produk atau jelajahi koleksi kami
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="bg-transparent">
                Belanja Produk
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-12 text-sm text-muted-foreground">
            Ada pertanyaan? Hubungi kami di{' '}
            <a
              href="mailto:support@bakpiajogja.com"
              className="text-primary hover:underline font-semibold"
            >
              support@bakpiajogja.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
