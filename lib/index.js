const PORT = 8080
const pov = require('point-of-view')
const fastify = require('fastify')()
const ejs = require('ejs')
const cors = require('cors')

fastify.use(cors())

fastify.register(pov, { engine: { ejs } })

fastify.get('/register', (req, reply) => {
  reply.view('/templates/index.ejs', { text: 'hello word' })
})

fastify.post('/send', (req, reply) => {
  console.log('SEND mobileNumber', req.query.mobileNumber)
  reply.send({ hello: 'world' })
})

fastify.listen(PORT, (err, address) => {
  if (err) console.log('ERROR:', err)

  console.log(`Listening on ${address}/register`)
})
