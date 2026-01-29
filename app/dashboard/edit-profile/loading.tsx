import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function EditProfileLoading() {
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

          {/* Profile content skeleton */}
          <div className="flex-1 p-6 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3" />
              
              {/* Tabs skeleton */}
              <div className="flex gap-4 border-b border-border">
                <div className="h-10 bg-muted rounded w-32" />
                <div className="h-10 bg-muted rounded w-32" />
              </div>

              {/* Form skeleton */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="flex gap-4">
                  <div className="h-10 bg-muted rounded flex-1" />
                  <div className="h-10 bg-muted rounded flex-1" />
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
