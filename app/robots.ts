import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/checkout/', '/login/', '/register/', '/payment-success/', '/api/'],
    },
    sitemap: 'https://bakpia3generasi.id/sitemap.xml',
  }
}
