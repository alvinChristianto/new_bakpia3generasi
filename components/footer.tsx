import { Facebook, Instagram, Twitter, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Bakpia Jogja Istimewa</h3>
            <p className="text-background/80 text-sm mb-4">
              Delivering authentic Indonesian Bakpia with tradition and quality since established.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-background transition">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-background transition">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-background transition">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Layanan Pelanggan</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <Link href="#" className="hover:text-background transition">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Kebijakan Pengiriman
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Kebijakan Pengembalian
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4">Informasi</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <Link href="#" className="hover:text-background transition">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-background transition">
                  Syarat dan Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
            <div className="space-y-3 text-sm text-background/80">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>(0274) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@bakpia.id</span>
              </div>
              <p>
                Jl. Bakpia Istimewa No. 42<br />
                Yogyakarta, Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-background/20 pt-8 mb-8">
          <h4 className="font-semibold mb-4">Metode Pembayaran yang Diterima</h4>
          <div className="flex flex-wrap gap-4">
            <div className="bg-background/20 px-4 py-2 rounded text-sm font-medium">
              BCA
            </div>
            <div className="bg-background/20 px-4 py-2 rounded text-sm font-medium">
              Mandiri
            </div>
            <div className="bg-background/20 px-4 py-2 rounded text-sm font-medium">
              GoPay
            </div>
            <div className="bg-background/20 px-4 py-2 rounded text-sm font-medium">
              OVO
            </div>
            <div className="bg-background/20 px-4 py-2 rounded text-sm font-medium">
              Visa/MasterCard
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/70">
          <p>
            © {new Date().getFullYear()} Bakpia Jogja Istimewa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
