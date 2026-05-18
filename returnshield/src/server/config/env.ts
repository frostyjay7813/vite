import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8787),
  MARGIN_SAVED_PER_HIGH_RISK_HOLD_CENTS: z.coerce.number().int().min(0).default(3200),

  SHOPIFY_API_KEY: z.string().min(1, 'SHOPIFY_API_KEY is required'),
  SHOPIFY_API_SECRET: z.string().min(1, 'SHOPIFY_API_SECRET is required'),
  SHOPIFY_APP_URL: z.string().url('SHOPIFY_APP_URL must be a valid URL'),
  SHOPIFY_SCOPES: z.string().min(1, 'SHOPIFY_SCOPES is required'),

  SESSION_SECRET: z
    .string()
    .min(16, 'SESSION_SECRET must be at least 16 characters'),

  DATABASE_URL: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('[ReturnShield] Invalid environment configuration')
  console.error(parsedEnv.error.flatten().fieldErrors)
  throw new Error('ReturnShield environment validation failed.')
}

export const env = parsedEnv.data
