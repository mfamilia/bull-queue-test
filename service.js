import { App } from '@tinyhttp/app'
import { once } from 'events'

const app = new App()
const [PORT, _rest] = process.argv.slice(2)
const handleMessage = async (req, res) => {
  const data = await once(req, 'data').then(d => d.toString())
  const msg = `Message received: ${data}`
  console.log(msg)

  res.end(msg)
}
const startupMessage = () => console.log(`Started on http://localhost:${PORT}!`)

app
  .post('/', handleMessage)
  .listen(PORT, startupMessage)
