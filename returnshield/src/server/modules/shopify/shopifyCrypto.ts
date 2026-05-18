import crypto from 'node:crypto'

export function buildShopifyAuthHmacPayload(
  query: Record<string, string | undefined>,
) {
  return Object.entries(query)
    .filter(([key, value]) => key !== 'hmac' && value !== undefined)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

export function verifyShopifyAuthHmac(params: {
  query: Record<string, string | undefined>
  secret: string
  hmac: string
}) {
  const payload = buildShopifyAuthHmacPayload(params.query)

  const digest = crypto
    .createHmac('sha256', params.secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(params.hmac))
}

export function verifyShopifyWebhookHmac(params: {
  rawBody: Buffer
  secret: string
  hmacHeader: string
}) {
  const digest = crypto
    .createHmac('sha256', params.secret)
    .update(params.rawBody)
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(params.hmacHeader),
  )
}

export function createNonce() {
  return crypto.randomBytes(24).toString('hex')
}
