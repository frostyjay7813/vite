export type ApiResponse<TData> =
  | {
      ok: true
      data: TData
    }
  | {
      ok: false
      error: {
        code: string
        message: string
      }
    }

export type ApiHealth = {
  app: string
  status: string
  service: string
  timestamp: string
}

export type DashboardMetrics = {
  returnsScored: number
  highRiskHolds: number
  estimatedMarginSavedCents: number
  reviewWorkflows: number
  lastUpdated: string
}

export type ReviewQueueJob = {
  id: string
  topic: string
  shopDomain: string
  receivedAt: string
}

export type ReviewQueueData = {
  count: number
  jobs: ReviewQueueJob[]
}
