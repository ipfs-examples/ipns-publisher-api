import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
})

fastify.get('/status', async (request, reply) => {
  return { up: true }
})

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
