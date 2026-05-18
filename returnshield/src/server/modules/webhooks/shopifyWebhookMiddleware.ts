import type { NextFunction, Request, Response } from 'express'
import { env } from '../../config/env'
import { sendFailure } from '../../shared/jsonResponse'
import { verifyShopifyWebhookHmac } from '../shopify/shopifyCrypto'

export type ShopifyWebhookRequest = Request & {
  rawBody?: Buffer
}

export function verifyShopifyWebhook(
  request: ShopifyWebhookRequest,
  response: Response,
  next: NextFunction,
) {
  const hmacHeader = request.header('x-shopify-hmac-sha256')
  const topic = request.header('x-shopify-topic')
  const shopDomain = request.header('x-shopify-shop-domain')

  if (!hmacHeader || !topic || !shopDomain) {
    return sendFailure(
      response,
      'MISSING_WEBHOOK_HEADERS',
      'Required Shopify webhook headers are missing.',
      401,
    )
  }

  if (!request.rawBody) {
    return sendFailure(
      response,
      'MISSING_RAW_BODY',
      'Webhook raw body is unavailable.',
      500,
    )
  }

  const isValid = verifyShopifyWebhookHmac({
    rawBody: request.rawBody,
    secret: env.SHOPIFY_API_SECRET,
    hmacHeader,
  })

  if (!isValid) {
    return sendFailure(
      response,
      'INVALID_WEBHOOK_HMAC',
      'Webhook HMAC validation failed.',
      401,
    )
  }

  return next()
}
