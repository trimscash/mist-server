import express from 'express'
import path from 'path'
import mistRouter from './route/mistRouter'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = 4000

app.use(express.json({ limit: '50mb' }))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.use('/', mistRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).send({ message: 'not found' })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
}).timeout = 1000 * 60 * 10
