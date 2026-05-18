import { env } from './config/env'
import { createServer } from './http/createServer'

const app = createServer()

app.listen(env.PORT, '0.0.0.0', () => {
  console.info(`[ReturnShield] API listening on http://0.0.0.0:${env.PORT}`)
})
