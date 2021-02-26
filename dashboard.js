import Queue from 'bull'
import { setQueues, BullAdapter, router } from 'bull-board'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const { REDIS_URL } = process.env
const queue = new Queue('messages', REDIS_URL)

setQueues([
  new BullAdapter(queue)
])

const [PORT, _rest] = process.argv.slice(2)
const app = express()

app.use('/', router)

app.listen(PORT, () => {
  console.log(`Dashboard listening at http://localhost:${PORT}/`)
})