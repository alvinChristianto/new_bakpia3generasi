export default function AddressesLoading() {
  return (
    <>
      <div className="h-16 bg-card border-b border-border" />
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border animate-pulse" />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-10 bg-muted rounded-lg animate-pulse w-64" />
            <div className="h-6 bg-muted rounded-lg animate-pulse w-32" />
            <div className="h-10 bg-muted rounded-lg animate-pulse w-40" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3 animate-pulse">
                  <div className="h-6 bg-muted rounded-lg w-1/2" />
                  <div className="h-4 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
