import { FastifyInstance, FastifyPluginAsync } from 'fastify'

// define plugin using promises
const statusPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { up: true }
  })

  fastify.get('/peers', async (request, reply) => {
    return JSON.stringify(fastify.libp2p.getPeers())
  })

  fastify.get('/id', async (request, reply) => {
    return {
      id: fastify.libp2p.peerId.toString(),
      protocols: fastify.libp2p.getProtocols(),
    }
  })

  fastify.get('/connections', async (request, reply) => {
    return JSON.stringify(fastify.libp2p.getConnections())
  })
  fastify.get('/subscriptions', async (request, reply) => {
    return fastify.libp2p.pubsub.getTopics()
  })
}

export default statusPlugin
