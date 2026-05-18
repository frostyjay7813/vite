import {
  AlertTriangle,
  BadgeDollarSign,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { MetricCard } from '../../shared/components/MetricCard'
import { useApiHealth } from './useApiHealth'
import { useDashboardMetrics } from './useDashboardMetrics'
import { useReviewQueue } from './useReviewQueue'

export function DashboardPage() {
  const apiHealth = useApiHealth()
  const dashboardMetrics = useDashboardMetrics()
  const reviewQueue = useReviewQueue()
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())

  console.info('[ReturnShield] Dashboard initialized')

  useEffect(() => {
    const timerId = setInterval(() => {
      setNowTimestamp(Date.now())
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

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

  const returnsScoredLabel =
    dashboardMetrics.status === 'ready'
      ? dashboardMetrics.data.returnsScored.toLocaleString('en-US')
      : '--'

  const highRiskHoldsLabel =
    dashboardMetrics.status === 'ready'
      ? dashboardMetrics.data.highRiskHolds.toLocaleString('en-US')
      : '--'

  const marginSavedLabel =
    dashboardMetrics.status === 'ready'
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(dashboardMetrics.data.estimatedMarginSavedCents / 100)
      : '--'

  const reviewWorkflowsLabel =
    dashboardMetrics.status === 'ready'
      ? dashboardMetrics.data.reviewWorkflows.toLocaleString('en-US')
      : '--'

  const metricsDetail =
    dashboardMetrics.status === 'ready' && dashboardMetrics.data.lastUpdated
      ? `Updated ${Math.max(
          0,
          Math.floor(
            (nowTimestamp - new Date(dashboardMetrics.data.lastUpdated).getTime()) /
              1000,
          ),
        )}s ago`
      : dashboardMetrics.status === 'loading'
        ? 'Loading live metrics'
        : 'Unable to load metrics'

  const metricsAgeSeconds =
    dashboardMetrics.status === 'ready' && dashboardMetrics.data.lastUpdated
      ? Math.max(
          0,
          Math.floor(
            (nowTimestamp - new Date(dashboardMetrics.data.lastUpdated).getTime()) /
              1000,
          ),
        )
      : null

  const metricsDetailClassName =
    metricsAgeSeconds === null
      ? 'text-slate-400'
      : metricsAgeSeconds >= 60
        ? 'text-red-300'
        : metricsAgeSeconds >= 30
          ? 'text-amber-300'
          : 'text-slate-400'

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
              value={returnsScoredLabel}
              detail={metricsDetail}
              detailClassName={metricsDetailClassName}
            />
            <MetricCard
              icon={<AlertTriangle className="h-6 w-6" />}
              label="High-risk holds"
              value={highRiskHoldsLabel}
              detail={metricsDetail}
              detailClassName={metricsDetailClassName}
            />
            <MetricCard
              icon={<BadgeDollarSign className="h-6 w-6" />}
              label="Estimated margin saved"
              value={marginSavedLabel}
              detail={metricsDetail}
              detailClassName={metricsDetailClassName}
            />
            <MetricCard
              icon={<Workflow className="h-6 w-6" />}
              label="Review workflows"
              value={reviewWorkflowsLabel}
              detail={metricsDetail}
              detailClassName={metricsDetailClassName}
            />
          </section>

          {dashboardMetrics.status === 'error' ? (
            <section className="mt-4 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3">
              <p className="text-sm font-semibold text-red-300">
                Metrics API unavailable
              </p>
              <p className="mt-1 text-xs text-red-200">
                Showing stale or empty values until connectivity is restored.
              </p>
            </section>
          ) : null}

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Return review queue</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Live webhook ingestion queue.
                </p>
              </div>
              <span className="rounded-full border border-neon-purple/40 px-4 py-2 text-sm text-neon-purple">
                {reviewQueue.status === 'ready'
                  ? `${reviewQueue.data.count} jobs`
                  : reviewQueue.status === 'loading'
                    ? 'Loading'
                    : 'Unavailable'}
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
                  {reviewQueue.status === 'ready' &&
                  reviewQueue.data.jobs.length > 0 ? (
                    reviewQueue.data.jobs.map((job) => {
                      const riskLabel = job.topic.toLowerCase().includes('return')
                        ? 'High'
                        : 'Review'

                      return (
                        <tr key={job.id} className="border-t border-white/10">
                          <td className="px-4 py-4 font-semibold text-neon-cyan">
                            {job.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-4 text-slate-200">
                            {job.topic}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
                              {riskLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-400">
                            {job.shopDomain} ·{' '}
                            {new Date(job.receivedAt).toLocaleTimeString('en-US')}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-4 text-slate-400" colSpan={4}>
                        {reviewQueue.status === 'loading'
                          ? 'Loading queue...'
                          : reviewQueue.status === 'error'
                            ? 'Unable to load queue.'
                            : 'No webhook jobs yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
