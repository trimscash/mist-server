import { Queue, QueueEvents, Worker } from 'bullmq'
import { mistQueue, mistQueueEvents } from '../queue/mistQueue'
import dotenv from 'dotenv'
import childProcess, { execSync } from 'child_process'
import util from 'util'

dotenv.config()

const exec = util.promisify(childProcess.exec)

const mistDirectory = process.env.MIST_DIRECTORY || ''
const mistQueueName = 'mist'

const worker = new Worker(
  mistQueueName,
  async (job) => {
    try {
      await exec(
        process.env.IS_TEST == 'true'
          ? `cp temp/input/${job.data.filename} temp/output/${job.data.filename} && sleep 10`
          : `python mist_v3.py --block_num 2 -img temp/input/${job.data.filename} --output_name temp/output/${job.data.filename} --non_resize`,
        {
          cwd: mistDirectory,
        }
      )
    } catch (e) {}
  },
  {
    concurrency: 10,
    connection: { port: 6379, host: process.env.REDIS_URL || 'localhost' },
  }
)
