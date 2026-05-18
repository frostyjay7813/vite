import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

function applyRequiredEnv() {
  process.env.NODE_ENV = 'test'
  process.env.PORT = '8787'
  process.env.SHOPIFY_API_KEY = 'test_key'
  process.env.SHOPIFY_API_SECRET = 'test_secret'
  process.env.SHOPIFY_APP_URL = 'http://localhost:5173'
  process.env.SHOPIFY_SCOPES = 'read_orders'
  process.env.SESSION_SECRET = '1234567890abcdef'
}

async function loadServer() {
  vi.resetModules()
  const [{ createServer }, queue] = await Promise.all([
    import('./createServer'),
    import('../queue/webhookQueue'),
  ])
  return {
    app: createServer(),
    clearWebhookJobs: queue.clearWebhookJobs,
    enqueueWebhookJob: queue.enqueueWebhookJob,
  }
}

describe('GET /api/dashboard/metrics', () => {
  let clearWebhookJobs: () => void = () => {}

  afterEach(() => {
    clearWebhookJobs()
    delete process.env.MARGIN_SAVED_PER_HIGH_RISK_HOLD_CENTS
  })

  it('returns expected shape and default margin config', async () => {
    applyRequiredEnv()
    const server = await loadServer()
    clearWebhookJobs = server.clearWebhookJobs

    server.enqueueWebhookJob({
      id: 'job-1',
      topic: 'returns/create',
      shopDomain: 'shop-a.myshopify.com',
      payload: {},
      receivedAt: new Date().toISOString(),
    })

    server.enqueueWebhookJob({
      id: 'job-2',
      topic: 'orders/updated',
      shopDomain: 'shop-a.myshopify.com',
      payload: {},
      receivedAt: new Date().toISOString(),
    })

    const response = await request(server.app).get('/api/dashboard/metrics')

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.data).toMatchObject({
      returnsScored: 2,
      highRiskHolds: 1,
      estimatedMarginSavedCents: 3200,
      reviewWorkflows: 3,
    })
    expect(typeof response.body.data.lastUpdated).toBe('string')
  })

  it('uses env override for per-hold margin', async () => {
    applyRequiredEnv()
    process.env.MARGIN_SAVED_PER_HIGH_RISK_HOLD_CENTS = '4500'
    const server = await loadServer()
    clearWebhookJobs = server.clearWebhookJobs

    server.enqueueWebhookJob({
      id: 'job-3',
      topic: 'returns/approved',
      shopDomain: 'shop-b.myshopify.com',
      payload: {},
      receivedAt: new Date().toISOString(),
    })

    const response = await request(server.app).get('/api/dashboard/metrics')

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.data.estimatedMarginSavedCents).toBe(4500)
  })
})
