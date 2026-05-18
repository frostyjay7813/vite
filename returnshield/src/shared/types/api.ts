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
