export type WebhookJob = {
  id: string
  topic: string
  shopDomain: string
  payload: unknown
  receivedAt: string
}

const jobs: WebhookJob[] = []

export function enqueueWebhookJob(job: WebhookJob) {
  jobs.push(job)

  console.info(
    `[ReturnShield] Queued webhook ${job.id} topic=${job.topic} shop=${job.shopDomain}`,
  )

  return job
}

export function listWebhookJobs() {
  return [...jobs]
}
