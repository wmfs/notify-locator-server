const pov = require('point-of-view')
const fastify = require('fastify')()
const ejs = require('ejs')
const cors = require('cors')
const nanoid = require('nanoid/generate')
const NotifyClient = require('notifications-node-client').NotifyClient

const PORT = 8080
const URL = 'http://localhost:8080/'
const ALPHABET = 'abcdefghijklmnopqrstvwxyzABCDEFGHIJKLMNOPQRSTVWXYZ1234567890'
const {
  GOV_UK_NOTIFY_API_KEY,
  GOV_UK_TEMPLATE_ID
} = process.env

fastify.use(cors())

fastify.register(pov, { engine: { ejs } })

fastify.get('/register', (req, reply) => {
  reply.view('/templates/index.ejs', { URL })
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
  } catch (e) {
    console.log('Error sending sms')
    statusCode = e.statusCode
  }

  reply.send({ statusCode })
})

fastify.listen(PORT, (err, address) => {
  if (err) console.log('ERROR:', err)

  console.log(`Listening on ${address}/register`)
})
