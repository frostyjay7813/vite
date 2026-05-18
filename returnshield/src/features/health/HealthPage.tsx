export function HealthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neon-ink p-6 text-white">
      <section className="rounded-3xl border border-neon-cyan/30 bg-white/8 p-8 shadow-neon backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-neon-cyan">
          ReturnShield
        </p>
        <h1 className="mt-3 text-3xl font-black">System healthy</h1>
        <p className="mt-3 text-slate-300">Frontend shell is running.</p>
      </section>
    </main>
  )
}
