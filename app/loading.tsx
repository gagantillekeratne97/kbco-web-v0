import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-navy/10 ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* KPI cards skeleton */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
                <Skeleton className="h-7 w-32 mt-3" />
                <Skeleton className="h-3 w-28 mt-2" />
              </div>
            ))}
          </section>

          {/* Revenue chart + machine status skeleton */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
              <Skeleton className="h-[220px] w-full mt-4" />
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-5">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </section>

          {/* Recent invoices table skeleton */}
          <section className="bg-card border border-border rounded-xl shadow-card p-5">
            <Skeleton className="h-4 w-40" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}