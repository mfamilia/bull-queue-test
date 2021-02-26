import Queue from 'bull'
import dotenv from 'dotenv'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .command('target_count', 'How many services to generate messages for', {
    targets: {
      description: 'the number of services',
      alias: 'tc',
      type: 'number'
    }
  })
  .command('message_count', 'How many messages to generate per service', {
    messages: {
      description: 'the number of messages',
      alias: 'mc',
      type: 'number'
    }
  })
  .help()
  .alias('help', 'h')
  .argv

dotenv.config()

const { REDIS_URL } = process.env
const queue = new Queue('messages', REDIS_URL, {
  limiter: {
    max: 5,
    duration: 5000,
    bounceBack: true
  }
})

const addJob = async (serviceCount, messageCount) => {
  await queue.add({ port: 3000 + serviceCount }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  })

  if (messageCount >= 0) {
    return addJob(serviceCount, --messageCount)
  } 
  
  if (serviceCount > 0) {
    return addJob(--serviceCount, argv.mc)
  }
}

addJob(argv.tc, argv.mc)
  .then(() => console.log('Done'))