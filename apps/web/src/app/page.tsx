export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        <div className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 border border-blue-500/20 mb-4">
          Phase 8 Frontend Initialized
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
          DistribuCore Web
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Next.js 14+ client workspace connected to Go Fiber multi-tenant API.
        </p>
        <div className="rounded-lg bg-slate-950/80 p-3 text-xs font-mono text-slate-300 border border-slate-800/80">
          API Target: http://localhost:8080/api/v1
        </div>
      </div>
    </main>
  );
}
