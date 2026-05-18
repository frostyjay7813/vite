import { useEffect, useState } from 'react'
import type { ApiResponse, ReviewQueueData } from '../../shared/types/api'

const REVIEW_QUEUE_POLL_INTERVAL_MS = 15000

type ReviewQueueState =
  | {
      status: 'loading'
      data: null
    }
  | {
      status: 'ready'
      data: ReviewQueueData
    }
  | {
      status: 'error'
      data: null
    }

export function useReviewQueue() {
  const [state, setState] = useState<ReviewQueueState>({
    status: 'loading',
    data: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadReviewQueue() {
      try {
        const response = await fetch('/api/webhooks/jobs')
        const payload = (await response.json()) as ApiResponse<ReviewQueueData>

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

    void loadReviewQueue()
    const intervalId = setInterval(() => {
      void loadReviewQueue()
    }, REVIEW_QUEUE_POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  return state
}
