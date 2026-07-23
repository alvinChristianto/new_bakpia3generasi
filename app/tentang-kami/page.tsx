import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami - Bakpia 3 Generasi",
  description:
    "Pelajari sejarah dan keunikan Bakpia 3 Generasi. Produk bakpia autentik dengan resep tradisional yang telah dipercaya selama puluhan tahun.",
  keywords: [
    "tentang kami",
    "bakpia 3 generasi",
    "bakpia istimewa",
    "sejarah bakpia",
  ],
  alternates: { canonical: "/tentang-kami" },
  openGraph: {
    title: "Tentang Kami - Bakpia 3 Generasi",
    description:
      "Pelajari sejarah dan keunikan Bakpia 3 Generasi. Produk bakpia autentik dengan resep tradisional yang telah dipercaya selama puluhan tahun.",
    url: "/tentang-kami",
    images: [
      {
        url: "/bakpia-tentang-kami.jpg",
        width: 1200,
        height: 630,
        alt: "Tentang Bakpia 3 Generasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang Kami - Bakpia 3 Generasi",
    description: "Pelajari sejarah dan keunikan Bakpia 3 Generasi.",
    images: ["/promo.webp"],
  },
};

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
              Mengenal lebih dekat Bakpia 3 Generasi dan perjalanan kami dalam
              menjaga keaslian rasa tradisional
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative h-96 md:h-full min-h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/bakpia-about.webp"
                alt="Proses pembuatan Bakpia 3 Generasi"
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
                  Bakpia 3 Generasi menghadirkan cita rasa autentik khas Jogja
                  yang dibuat dari resep turun-temurun dengan bahan-bahan
                  premium pilihan. Diproduksi fresh setiap hari, setiap bakpia
                  memiliki tekstur lembut, isian melimpah, dan rasa yang
                  konsisten di setiap gigitan. Perpaduan kualitas dan kelezatan
                  ini menjadikannya pilihan tepat bagi pecinta bakpia premium.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Tidak hanya lezat untuk dinikmati sendiri, Bakpia 3 Generasi
                  juga hadir dengan kemasan premium yang cocok dijadikan
                  oleh-oleh untuk keluarga, teman, maupun kolega. Setiap
                  kotaknya membawa cita rasa khas Jogja yang berkesan dan selalu
                  dirindukan. Jadikan Bakpia 3 Generasi sebagai pilihan
                  oleh-oleh terbaik yang menghadirkan kualitas, kelezatan, dan
                  kebanggaan dalam setiap momen.
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
                {
                  title: "Otentik",
                  description:
                    "Dibuat dengan resep turun-temurun menggunakan bahan pilihan, menghadirkan bakpia autentik khas Jogja dengan rasa yang lembut, legit, dan selalu bikin kangen",
                },
                {
                  title: "Fresh Setiap Hari",
                  description:
                    "Diproduksi secara fresh dengan kualitas yang terjaga, sehingga setiap gigitan memberikan pengalaman menikmati bakpia premium",
                },
                {
                  title: "Bakpia Premium",
                  description:
                    "Bakpia premium dengan bahan-bahan berkualitas tinggi, menghadirkan pengalaman menikmati bakpia yang luar biasa",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
