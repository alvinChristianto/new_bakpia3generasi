import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { OutletAccordion, OutletGroup } from "@/components/outlet-accordion";
import { OUTLET_GROUPS } from "@/app/outlet-kami/outlets-data";

export const metadata: Metadata = {
  title: "Outlet Kami - Bakpia 3 Generasi",
  description:
    "Temukan outlet Bakpia 3 Generasi di Yogyakarta. Kunjungi outlet resmi dan The Cabin Hotel untuk membeli bakpia premium secara langsung.",
  keywords: [
    "outlet bakpia",
    "toko bakpia yogyakarta",
    "bakpia 3 generasi",
    "outlet resmi",
    "the cabin hotel",
  ],
  alternates: { canonical: "/outlet-kami" },
  openGraph: {
    title: "Outlet Kami - Bakpia 3 Generasi",
    description:
      "Temukan outlet Bakpia 3 Generasi di Yogyakarta. Kunjungi outlet resmi dan The Cabin Hotel untuk membeli bakpia premium secara langsung.",
    url: "/outlet-kami",
    images: [
      {
        url: "/bakpia-tentang-kami.jpg",
        width: 1200,
        height: 630,
        alt: "Outlet Bakpia 3 Generasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Outlet Kami - Bakpia 3 Generasi",
    description:
      "Temukan outlet Bakpia 3 Generasi di Yogyakarta. Kunjungi outlet resmi dan The Cabin Hotel untuk membeli bakpia premium secara langsung.",
    images: ["/bakpia-tentang-kami.jpg"],
  },
};

function buildOutletSchema(groups: OutletGroup[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: groups.flatMap((group) =>
      group.outlets.map((outlet, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Store",
          name: outlet.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: outlet.address,
            addressLocality: "Yogyakarta",
            addressCountry: "ID",
          },
          openingHours: outlet.hours,
          hasMap: outlet.mapsUrl,
        },
      }))
    ),
  };
}

export default function OutletKamiPage() {
  const schema = buildOutletSchema(OUTLET_GROUPS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance mb-4">
              Outlet Kami
            </h1>
            <p className="text-lg text-muted-foreground text-balance mb-10">
              Outlet kami tersebar di daerah Yogyakarta, menawarkan
              kemudahan dalam membeli bakpia
            </p>

            <OutletAccordion groups={OUTLET_GROUPS} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
