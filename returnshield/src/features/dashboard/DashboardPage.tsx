import {
  AlertTriangle,
  BadgeDollarSign,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import { MetricCard } from '../../shared/components/MetricCard'
import { useApiHealth } from './useApiHealth'

const reviewItems = [
  {
    id: 'RS-1042',
    customer: 'High repeat return velocity',
    risk: 'High',
    reason:
      '4 refunds in 60 days, one item-not-received claim, high order value',
  },
  {
    id: 'RS-1043',
    customer: 'Address cluster match',
    risk: 'Review',
    reason: 'Shared shipping address with two prior refunded accounts',
  },
  {
    id: 'RS-1044',
    customer: 'Low-friction approval',
    risk: 'Low',
    reason: 'Long purchase history and low return rate',
  },
]

export function DashboardPage() {
  const apiHealth = useApiHealth()

  console.info('[ReturnShield] Dashboard initialized')

  const apiStatusLabel =
    apiHealth.status === 'ready'
      ? 'API connected'
      : apiHealth.status === 'loading'
        ? 'Checking API'
        : 'API offline'

  const apiStatusClassName =
    apiHealth.status === 'ready'
      ? 'text-neon-cyan'
      : apiHealth.status === 'loading'
        ? 'text-slate-300'
        : 'text-red-300'

  return (
    <main className="min-h-screen bg-neon-ink text-white">
      <section className="relative overflow-hidden px-6 py-8 sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(187,134,252,0.22),transparent_32%)]" />

        <div className="relative mx-auto max-w-7xl">
          <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/8 p-8 shadow-neon backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-neon-cyan">
                ReturnShield
              </p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
                AI return fraud defense for Shopify stores.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
                Score risky returns, surface reason codes, and route suspicious
                refunds into review before margin disappears.
              </p>
            </div>

            <div className="rounded-2xl border border-neon-cyan/30 bg-black/30 p-5 backdrop-blur-xl">
              <p className="text-sm text-slate-400">Backend status</p>
              <p className={`mt-2 text-2xl font-bold ${apiStatusClassName}`}>
                {apiStatusLabel}
              </p>
              {apiHealth.status === 'ready' ? (
                <p className="mt-2 text-xs text-slate-500">
                  {apiHealth.data.timestamp}
                </p>
              ) : null}
            </div>
          </header>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<ShieldCheck className="h-6 w-6" />}
              label="Returns scored"
              value="0"
              detail="Ready for Shopify ingestion"
            />
            <MetricCard
              icon={<AlertTriangle className="h-6 w-6" />}
              label="High-risk holds"
              value="0"
              detail="Risk engine pending"
            />
            <MetricCard
              icon={<BadgeDollarSign className="h-6 w-6" />}
              label="Estimated margin saved"
              value="$0"
              detail="ROI model pending"
            />
            <MetricCard
              icon={<Workflow className="h-6 w-6" />}
              label="Review workflows"
              value="3"
              detail="Approve, hold, investigate"
            />
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Return review queue</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Placeholder data until Shopify webhooks are connected.
                </p>
              </div>
              <span className="rounded-full border border-neon-purple/40 px-4 py-2 text-sm text-neon-purple">
                Phase 2
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-white/10 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Case</th>
                    <th className="px-4 py-3 font-semibold">Signal</th>
                    <th className="px-4 py-3 font-semibold">Risk</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewItems.map((item) => (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="px-4 py-4 font-semibold text-neon-cyan">
                        {item.id}
                      </td>
                      <td className="px-4 py-4 text-slate-200">
                        {item.customer}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
                          {item.risk}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
