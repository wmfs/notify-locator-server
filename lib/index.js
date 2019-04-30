const PORT = 8080
const pov = require('point-of-view')
const fastify = require('fastify')()
const ejs = require('ejs')

fastify.register(pov, { engine: { ejs } })

fastify.get('/', (req, reply) => {
  reply.view('/templates/index.ejs', { text: 'hello word' })
})

fastify.listen(PORT, err => {
  if (err) console.log('ERROR:', err)

  console.log(`Listening on http://localhost:${PORT}/`)
})
