import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tentang Kami - Bakpia Jogja Istimewa',
  description: 'Pelajari sejarah dan keunikan Bakpia Jogja Istimewa. Produk bakpia autentik dengan resep tradisional yang telah dipercaya selama puluhan tahun.',
  keywords: ['tentang kami', 'bakpia jogja', 'bakpia istimewa', 'sejarah bakpia'],
}

export default function TentangKamiPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance mb-4">
              Tentang Kami
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Mengenal lebih dekat Bakpia Jogja Istimewa dan perjalanan kami dalam menjaga keaslian rasa tradisional
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative h-96 md:h-full min-h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/bakpia-tentang-kami.jpg"
                alt="Proses pembuatan Bakpia Jogja Istimewa"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Warisan Otentik dari Yogyakarta
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Bakpia Jogja Istimewa adalah hasil dari dedikasi dan keahlian yang telah turun-temurun selama lebih dari lima puluh tahun. Dimulai dari sebuah dapur kecil di jantung kota Yogyakarta, kami berkomitmen untuk menghadirkan bakpia berkualitas tinggi dengan menggunakan bahan-bahan pilihan dan teknik pembuatan tradisional yang telah terbukti kesuksesannya. Setiap produk kami dibuat dengan cermat, memastikan cita rasa autentik yang menggugah selera dan meninggalkan kesan mendalam di setiap gigitan.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Kepercayaan konsumen selama puluhan tahun menjadi bukti nyata dari komitmen kami terhadap kualitas. Kami tidak hanya menjual produk, tetapi juga menjual cerita dan tradisi yang telah menjadi bagian dari warisan budaya Yogyakarta. Dalam setiap kemasan Bakpia Jogja Istimewa, kami membawa kepercayaan yang diberikan oleh jutaan pelanggan setia kami. Rasakan sendiri cita rasa autentik yang telah memenangkan hati generasi demi generasi, dan jadilah bagian dari perjalanan kami dalam melestarikan kuliner tradisional Indonesia yang sesungguhnya.
                </p>
              </div>

              <Link href="/">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                  Belanja Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20 px-4 md:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Nilai-Nilai Kami
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Keaslian', description: 'Menggunakan resep dan bahan asli yang telah terbukti kualitasnya' },
                { title: 'Tradisi', description: 'Menjaga metode pembuatan tradisional yang telah teruji waktu' },
                { title: 'Kepercayaan', description: 'Komitmen pada kepuasan pelanggan adalah prioritas utama kami' },
              ].map((value, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
