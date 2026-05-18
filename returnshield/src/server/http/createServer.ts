import type { Request } from 'express'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { shopifyOAuthRouter } from '../modules/shopify/shopifyOAuth'
import { shopifyWebhookRouter } from '../modules/webhooks/shopifyWebhookRoutes'
import { sendSuccess } from '../shared/jsonResponse'

export function createServer() {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(morgan('dev'))

  app.use(
    express.json({
      verify: (request: Request, _response, buffer) => {
        request.rawBody = buffer
      },
    }),
  )

  app.get('/api/health', (_request, response) => {
    return sendSuccess(response, {
      app: 'ReturnShield',
      status: 'healthy',
      service: 'api',
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/api/shopify', shopifyOAuthRouter)
  app.use('/api/webhooks', shopifyWebhookRouter)

  return app
}
