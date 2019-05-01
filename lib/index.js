const UPDATES = {}

const pov = require('point-of-view')
const fastify = require('fastify')()
const ejs = require('ejs')
const cors = require('cors')
const nanoid = require('nanoid/generate')
const NotifyClient = require('notifications-node-client').NotifyClient
const fastifyWebsocket = require('fastify-websocket')

const EventEmitter = require('events')
const emitter = new EventEmitter()

const ALPHABET = 'abcdefghijklmnopqrstvwxyzABCDEFGHIJKLMNOPQRSTVWXYZ1234567890'
const {
  GOV_UK_NOTIFY_API_KEY,
  GOV_UK_TEMPLATE_ID,
  URL,
  PORT
} = process.env

fastify.use(cors())

fastify.register(pov, { engine: { ejs } })
fastify.register(fastifyWebsocket, { handle })

function handle (conn, req) {
  emitter.on('update', data => {
    conn.write(JSON.stringify(data))
  })
}

fastify.get('/register', (req, reply) => {
  reply.view('/templates/index.ejs', { URL, UPDATES })
})

fastify.get('/locator/:uuid', (req, reply) => {
  const { uuid } = req.params
  const info = UPDATES[uuid]
  reply.view('/templates/locator.ejs', { uuid, info })
})

fastify.post('/send', async (req, reply) => {
  const { mobileNumber } = req.query
  const uuid = nanoid(ALPHABET, 8)
  const url = `${URL}locator/${uuid}`
  const notifyClient = new NotifyClient(GOV_UK_NOTIFY_API_KEY)
  const input = { personalisation: { url } }

  let statusCode

  try {
    const response = await notifyClient.sendSms(GOV_UK_TEMPLATE_ID, mobileNumber, input)
    statusCode = response.statusCode

    UPDATES[uuid] = { status: 'pending' }
  } catch (e) {
    console.log('Error sending sms')
    statusCode = e.statusCode
  }

  emitter.emit('update', UPDATES)
  reply.send({ statusCode })
})

fastify.post('/update', (req, reply) => {
  const { uuid, status, lat, lon } = req.query

  if (lat && lon) UPDATES[uuid] = { status, lat, lon }
  else UPDATES[uuid] = { status }

  emitter.emit('update', UPDATES)
  reply.send()
})

fastify.listen(PORT, (err, address) => {
  if (err) console.log('ERROR:', err)

  console.log(`Listening on ${address}/register`)
})
