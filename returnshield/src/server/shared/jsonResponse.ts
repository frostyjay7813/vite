import type { Response } from 'express'

export type ApiSuccess<TData> = {
  ok: true
  data: TData
}

export type ApiFailure = {
  ok: false
  error: {
    code: string
    message: string
  }
}

export function sendSuccess<TData>(
  response: Response,
  data: TData,
  status = 200,
) {
  return response.status(status).json({
    ok: true,
    data,
  } satisfies ApiSuccess<TData>)
}

export function sendFailure(
  response: Response,
  code: string,
  message: string,
  status = 400,
) {
  return response.status(status).json({
    ok: false,
    error: {
      code,
      message,
    },
  } satisfies ApiFailure)
}
