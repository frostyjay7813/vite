import type { Request, Response } from 'express'
import { Router } from 'express'
import { env } from '../../config/env'
import { sendFailure, sendSuccess } from '../../shared/jsonResponse'
import { createNonce, verifyShopifyAuthHmac } from './shopifyCrypto'

const shopDomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/

type ShopifyTokenResponse = {
  access_token: string
  scope: string
}

const pendingOAuthStates = new Map<string, string>()

export const shopifyOAuthRouter = Router()

shopifyOAuthRouter.get('/install', (request: Request, response: Response) => {
  const shop = String(request.query.shop ?? '')

  if (!shopDomainPattern.test(shop)) {
    return sendFailure(
      response,
      'INVALID_SHOP',
      'A valid myshopify.com shop domain is required.',
      400,
    )
  }

  const state = createNonce()
  pendingOAuthStates.set(state, shop)

  const redirectUri = new URL('/api/shopify/callback', env.SHOPIFY_APP_URL)
  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`)

  authUrl.searchParams.set('client_id', env.SHOPIFY_API_KEY)
  authUrl.searchParams.set('scope', env.SHOPIFY_SCOPES)
  authUrl.searchParams.set('redirect_uri', redirectUri.toString())
  authUrl.searchParams.set('state', state)

  console.info(`[ReturnShield] OAuth install started for ${shop}`)

  return response.redirect(authUrl.toString())
})

shopifyOAuthRouter.get(
  '/callback',
  async (request: Request, response: Response) => {
    const shop = String(request.query.shop ?? '')
    const code = String(request.query.code ?? '')
    const state = String(request.query.state ?? '')
    const hmac = String(request.query.hmac ?? '')

    if (!shopDomainPattern.test(shop)) {
      return sendFailure(
        response,
        'INVALID_SHOP',
        'A valid myshopify.com shop domain is required.',
        400,
      )
    }

    if (!code || !state || !hmac) {
      return sendFailure(
        response,
        'INVALID_CALLBACK',
        'OAuth callback is missing required parameters.',
        400,
      )
    }

    const expectedShop = pendingOAuthStates.get(state)

    if (expectedShop !== shop) {
      return sendFailure(
        response,
        'INVALID_STATE',
        'OAuth state validation failed.',
        401,
      )
    }

    const query = Object.fromEntries(
      Object.entries(request.query).map(([key, value]) => [key, String(value)]),
    )

    const isHmacValid = verifyShopifyAuthHmac({
      query,
      secret: env.SHOPIFY_API_SECRET,
      hmac,
    })

    if (!isHmacValid) {
      return sendFailure(
        response,
        'INVALID_HMAC',
        'OAuth HMAC validation failed.',
        401,
      )
    }

    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.SHOPIFY_API_KEY,
          client_secret: env.SHOPIFY_API_SECRET,
          code,
        }),
      },
    )

    if (!tokenResponse.ok) {
      return sendFailure(
        response,
        'TOKEN_EXCHANGE_FAILED',
        'Shopify access token exchange failed.',
        502,
      )
    }

    const tokenPayload = (await tokenResponse.json()) as ShopifyTokenResponse

    pendingOAuthStates.delete(state)

    console.info(`[ReturnShield] OAuth install completed for ${shop}`)
    console.info(
      `[ReturnShield] Token scope received for ${shop}: ${tokenPayload.scope}`,
    )

    return response.redirect('/?installed=1')
  },
)

shopifyOAuthRouter.get('/status', (_request: Request, response: Response) => {
  return sendSuccess(response, {
    module: 'shopify-oauth',
    status: 'ready',
    appName: 'ReturnShield',
  })
})
