import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function DashboardLoading() {
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

          {/* Main content skeleton */}
          <div className="flex-1 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3" />
              
              {/* Cards grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>

              {/* Content section skeleton */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
