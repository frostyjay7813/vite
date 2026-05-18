import { useEffect, useState } from 'react'
import type { ApiHealth, ApiResponse } from '../../shared/types/api'

type ApiHealthState =
  | {
      status: 'loading'
      data: null
    }
  | {
      status: 'ready'
      data: ApiHealth
    }
  | {
      status: 'error'
      data: null
    }

export function useApiHealth() {
  const [state, setState] = useState<ApiHealthState>({
    status: 'loading',
    data: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadApiHealth() {
      try {
        const response = await fetch('/api/health')
        const payload = (await response.json()) as ApiResponse<ApiHealth>

        if (!isMounted) {
          return
        }

        if (payload.ok) {
          setState({
            status: 'ready',
            data: payload.data,
          })
          return
        }

        setState({
          status: 'error',
          data: null,
        })
      } catch {
        if (!isMounted) {
          return
        }

        setState({
          status: 'error',
          data: null,
        })
      }
    }

    void loadApiHealth()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
