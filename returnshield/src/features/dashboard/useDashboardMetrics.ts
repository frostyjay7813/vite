import { useEffect, useState } from 'react'
import type { ApiResponse, DashboardMetrics } from '../../shared/types/api'

const METRICS_POLL_INTERVAL_MS = 15000

type DashboardMetricsState =
  | {
      status: 'loading'
      data: null
    }
  | {
      status: 'ready'
      data: DashboardMetrics
    }
  | {
      status: 'error'
      data: null
    }

export function useDashboardMetrics() {
  const [state, setState] = useState<DashboardMetricsState>({
    status: 'loading',
    data: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadDashboardMetrics() {
      try {
        const response = await fetch('/api/dashboard/metrics')
        const payload = (await response.json()) as ApiResponse<DashboardMetrics>

        if (!isMounted) {
          return
        }

        if (payload.ok) {
          setState({
            status: 'ready',
            data: payload.data,
          })
          return
        }

        setState({
          status: 'error',
          data: null,
        })
      } catch {
        if (!isMounted) {
          return
        }

        setState({
          status: 'error',
          data: null,
        })
      }
    }

    void loadDashboardMetrics()
    const intervalId = setInterval(() => {
      void loadDashboardMetrics()
    }, METRICS_POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  return state
}
