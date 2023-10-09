import express from 'express'
import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
// import { fileTypeFromBuffer, FileTypeResult } from 'file-type'
import { z, ZodError } from 'zod'
import { exec } from 'child_process'
import dotenv from 'dotenv'
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

router.post('', async (req, res, next) => {
  const filename = `${crypto.randomUUID()}.png`
  const inputfilepath = path.join(mistDirectory, 'temp/input', filename)
  const outputfilepath = path.join(mistDirectory, 'temp/output', filename)
  console.log(mistDirectory)

  try {
    console.log('bbb')
    requestSchema.parse({ ...req.body })
    console.log('ccc')

    const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
    // console.log(req.body.image)
    console.log('req.body.image')
    const decode = Buffer.from(base64Data, 'base64')
    // const type = await fileTypeFromBuffer(decode)
    // if (type === undefined) {
    //   return next(internalServerError('invalid file'))
    // }
    // if (type?.ext !== 'png') {
    //   return next(internalServerError('invalid file type'))
    // }

    fs.writeFileSync(inputfilepath, decode)
    await exec(
      `python3 mist_v3.py -img temp/input/${filename} --output_name ${filename}`,
      {
        cwd: mistDirectory,
      }
    )

    const output = fs.readFileSync(outputfilepath)

    /// remove temp file
    if (fs.existsSync(inputfilepath)) {
      fs.unlinkSync(inputfilepath)
    }
    if (fs.existsSync(outputfilepath)) {
      fs.unlinkSync(outputfilepath)
    }

    res.send('data:image/png;base64,/' + output.toString('base64'))
  } catch (error) {
    if (fs.existsSync(inputfilepath)) {
      fs.unlinkSync(inputfilepath)
    }
    if (fs.existsSync(outputfilepath)) {
      fs.unlinkSync(outputfilepath)
    }
    if (error instanceof ZodError) {
      res.status(500).send()
    }
    res.status(500).send()
  }
  next()
})

export default router
