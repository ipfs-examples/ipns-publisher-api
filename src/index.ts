import Fastify from 'fastify'
import heliaPlugin from './plugins/helia-plugin.js'
import * as dotenv from 'dotenv'
import { publishRecord } from './lib/ipns.js'
import { CID } from 'multiformats'
import { base36 } from 'multiformats/bases/base36'
import { peerIdFromString } from '@libp2p/peer-id'

dotenv.config()

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}

const fastify = Fastify({
  // @ts-ignore
  logger: envToLogger[process.env.NODE_ENV ?? 'production'] ?? true,
})

fastify.get('/', async (request, reply) => {
  return { up: true }
})

fastify.get('/peers', async (request, reply) => {
  return JSON.stringify(fastify.libp2p.getPeers())
})

fastify.get('/connections', async (request, reply) => {
  return JSON.stringify(fastify.libp2p.getConnections())
})

fastify.get('/ipns/names', async (request, reply) => {
  let keys = await fastify.libp2p.keychain.listKeys()
  let peers = keys.map((k) => peerIdFromString(k.id))


  return peers.map((p, i) => ({
    peerId: p.toString(),
    name: p.toCID().toString(base36),
    label: keys[i].name,
  }))
})

fastify.route({
  method: 'POST',
  url: '/ipns/names',
  schema: {
    querystring: {
      cid: { type: 'string' },
    },
  },
  handler: async (request, reply) => {
    const ipnsRecord = await publishRecord(
      fastify.libp2p,
      fastify.ipns,
      'self',
      'bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4',
    )

    return ipnsRecord
  },
})

fastify.register(heliaPlugin)

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
  return this.toString()
}
