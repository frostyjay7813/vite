import type { ReactNode } from 'react'

type MetricCardProps = {
  icon: ReactNode
  label: string
  value: string
  detail: string
  detailClassName?: string
}

export function MetricCard({
  icon,
  label,
  value,
  detail,
  detailClassName = 'text-slate-400',
}: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/8 p-6 shadow-purple backdrop-blur-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
        {icon}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
      <p className={`mt-3 text-sm ${detailClassName}`}>{detail}</p>
    </article>
  )
}
