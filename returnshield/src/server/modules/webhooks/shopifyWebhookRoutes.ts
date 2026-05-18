import type { Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { enqueueWebhookJob, listWebhookJobs } from '../../queue/webhookQueue'
import { sendSuccess } from '../../shared/jsonResponse'
import { verifyShopifyWebhook } from './shopifyWebhookMiddleware'

export const shopifyWebhookRouter = Router()

shopifyWebhookRouter.post(
  '/shopify',
  verifyShopifyWebhook,
  (request: Request, response: Response) => {
    const topic = request.header('x-shopify-topic') ?? 'unknown'
    const shopDomain = request.header('x-shopify-shop-domain') ?? 'unknown'

    const job = enqueueWebhookJob({
      id: randomUUID(),
      topic,
      shopDomain,
      payload: request.body,
      receivedAt: new Date().toISOString(),
    })

    return sendSuccess(
      response,
      {
        accepted: true,
        jobId: job.id,
      },
      202,
    )
  },
)

shopifyWebhookRouter.get('/jobs', (_request: Request, response: Response) => {
  return sendSuccess(response, {
    count: listWebhookJobs().length,
    jobs: listWebhookJobs(),
  })
})
