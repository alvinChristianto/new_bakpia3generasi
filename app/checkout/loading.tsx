import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function CheckoutLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8 px-4 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 h-8 bg-muted rounded-lg w-1/3 animate-pulse" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer form skeleton */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>

              {/* Products skeleton */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3" />
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-24 h-24 bg-background rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-background rounded w-1/2" />
                      <div className="h-4 bg-background rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Billing */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </div>
              </div>

              <div className="bg-muted border border-border rounded-lg p-6 animate-pulse">
                <div className="h-8 bg-background rounded mb-4 w-1/2" />
                <div className="space-y-3">
                  <div className="h-4 bg-background rounded" />
                  <div className="h-4 bg-background rounded" />
                </div>
              </div>

              <div className="h-12 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
