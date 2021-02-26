import Queue from 'bull'
import dotenv from 'dotenv'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import cluster from 'cluster'
import http from 'http'

const argv = yargs(hideBin(process.argv))
  .command('worker_count', 'How many workers to setup', {
    workers: {
      description: 'the number of workers',
      alias: 'wc',
      type: 'number'
    }
  })
  .help()
  .alias('help', 'h')
  .argv

dotenv.config()

const { REDIS_URL } = process.env
const queue = new Queue('messages', REDIS_URL)

if (cluster.isMaster) {
  for (var i = 0; i < argv.wc; i++) {
    cluster.fork()
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died')
  })
} else {
  queue.process((job, jobDone, ) => {
    setTimeout(() => {
      console.log(JSON.stringify(job, null, 2))
      const { port } = job.data
      const data = JSON.stringify({
        id: job.id,
        attempts: job.attemptsMade,
        failedReason: job.failedReason,
      })

      const options = {
        hostname: 'localhost',
        port,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }
      
      const req = http.request(options, res => {
        res.on('data', d => {
          process.stdout.write(d)
        })

        if (res.statusCode == 200) {
          jobDone(null, res.statusCode)
        }
      })
      
      req.on('error', err => {
        jobDone(err)
      })
      
      req.write(data)
      req.end()
    }, 2000)
  })
}