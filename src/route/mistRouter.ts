import express from 'express'
import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import { z, ZodError } from 'zod'
import dotenv from 'dotenv'
import { mistQueue, mistQueueEvents } from '../queue/mistQueue'
import '../worker/mistWorker'

dotenv.config()

const router = express.Router()

const requestSchema = z.object({
  //   strength: z.number().min(1).max(32).int(),
  //   steps: z.number().min(1).max(1000).int(),
  //   outputSize: z.union([z.literal('256'), z.literal('512'), z.literal('768')]),
  //   blockingNumber: z.union([z.literal('1'), z.literal('2')]),
  //   mode: z.union([z.literal('0'), z.literal('1'), z.literal('2')]),
  //   fusedWeight: z.number().min(1).max(5).int(),
  image: z.string().startsWith('data:image/png;base64,'),
})

const mistDirectory = process.env.MIST_DIRECTORY || ''

function checkPNG(data: Buffer): boolean {
  const pngMagicNum = Buffer.from([0x89, 0x50, 0x4e, 0x47])
  return pngMagicNum.equals(data.slice(0, 4))
}

router.post('', async (req, res, next) => {
  const filename = `${crypto.randomUUID()}.png`
  const inputfilepath = path.join(mistDirectory, 'temp/input', filename)
  const outputfilepath = path.join(mistDirectory, 'temp/output', filename)

  try {
    console.log('running..' + filename)
    requestSchema.parse({ ...req.body })

    const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')

    const decode = Buffer.from(base64Data, 'base64')

    const isPNG = checkPNG(decode)
    if (!isPNG) {
      throw 'notPNG'
    }

    fs.writeFileSync(inputfilepath, decode)

    const mistJob = await mistQueue.add('mist', {
      filename: filename,
    })

    await mistJob.waitUntilFinished(mistQueueEvents)

    console.log(fs.existsSync(outputfilepath))
    const outputBase64Data = fs.readFileSync(outputfilepath, {
      encoding: 'base64',
    })

    console.log('Done! ' + filename)

    res.send({
      status: 'success',
      image: 'data:image/png;base64,' + outputBase64Data,
    })
  } catch (error) {
    console.log('Failed! ' + filename)

    if (error == 'notPNG') {
      res.status(500).send({ status: 'success', message: 'file must be png' })
      return
    }

    if (error instanceof ZodError) {
      res.status(500).send({ status: 'failed', message: 'ivalid request body' })
      return
    }

    res.status(500).send({ status: 'failed', message: 'internal server error' })
    return
  } finally {
    console.log('removing ' + filename)
    // remove temp file
    if (fs.existsSync(inputfilepath)) {
      fs.unlinkSync(inputfilepath)
    }
    if (fs.existsSync(outputfilepath)) {
      fs.unlinkSync(outputfilepath)
    }
  }
})

router.get('', async (req, res, next) => {
  try {
    const jobCount = await mistQueue.getJobCounts('active', 'wait')

    res.status(500).send({
      status: 'success',
      message: 'now queue state',
      active_job: jobCount.active,
      wait_job: jobCount.wait,
    })
  } catch (e) {
    res.status(500).send({ status: 'failed', message: 'internal server error' })
  }
})

export default router
