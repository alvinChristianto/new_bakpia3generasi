import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function OrdersLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar skeleton */}
          <aside className="hidden md:block w-64 bg-card border-r border-border p-6 animate-pulse">
            <div className="h-8 bg-muted rounded mb-8 w-3/4" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </aside>

          {/* Orders content skeleton */}
          <div className="flex-1 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3" />
              
              {/* Order list skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-muted rounded w-1/4" />
                      <div className="h-6 bg-muted rounded w-1/6" />
                    </div>
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="flex gap-2 pt-4">
                      <div className="h-10 bg-muted rounded flex-1" />
                      <div className="h-10 bg-muted rounded flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
