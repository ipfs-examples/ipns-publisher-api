import Fastify from 'fastify'
import heliaPlugin from './helia-plugin.js'
import * as dotenv from 'dotenv'
import { publishRecord } from './ipns.js'

dotenv.config()

const fastify = Fastify({
  logger: true,
})

fastify.get('/', async (request, reply) => {
  return { up: true }
})

fastify.get('/peers', async (request, reply) => {
  return JSON.stringify(fastify.libp2p.getPeers())
})

fastify.get('/connections', async (request, reply) => {
  return JSON.stringify(fastify.libp2p.getPeers())
})

fastify.get('/ipns-test', async (request, reply) => {
  const ipnsRecord = await publishRecord(fastify.libp2p, fastify.ipns)
  return JSON.stringify(ipnsRecord)
})

fastify.register(heliaPlugin)

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
