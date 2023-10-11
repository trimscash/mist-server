import { Queue, QueueEvents, Worker } from 'bullmq'
import dotenv from 'dotenv'

dotenv.config()

const mistQueueName = 'mist'

export const mistQueue = new Queue(mistQueueName, {
  connection: { port: 6379, host: process.env.REDIS_URL || 'localhost' },
})
export const mistQueueEvents = new QueueEvents(mistQueueName)
