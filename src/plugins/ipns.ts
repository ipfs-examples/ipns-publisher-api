import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { publishRecord } from '../lib/ipns.js'
import { CID } from 'multiformats'
import { base36 } from 'multiformats/bases/base36'
import { peerIdFromString } from '@libp2p/peer-id'
import { base32 } from 'multiformats/bases/base32'

// Plugin for IPNS specific routes
const ipnsPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/ipns/names', async (request, reply) => {
    let keys = await fastify.libp2p.keychain.listKeys()

    // Create an array of the local keys, their label, and their CID representation
    let peers = keys.map((k) => {
      const peer = peerIdFromString(k.id)
      return {
        keyName: k.name,
        peerId: peer,
        nameb36: peer.toCID().toString(base36),
      }
    })

    // Resolve the current value of the IPNS records
    // TODO: figure out how to keep the IPNS resolve local
    let names = await Promise.all(
      peers.map((p) => fastify.ipns.resolve(p.peerId)),
    )

    // Merge the two arrays with the
    return peers.reduce((acc: {}[], cur, idx) => {
      acc.push({ ...cur, ipnsValue: names[idx].toString() })
      return acc
    }, [])
  })

  fastify.post<{ Params: { keyName: string; cid: string } }>(
    '/ipns/names/:keyName/:cid',
    {
      schema: {
        params: {
          cid: { type: 'string' },
          keyName: { type: 'string' },
        },
      },
      handler: async (request, reply) => {
        // fastify.ipns.publish()
        const ipnsRecord = await publishRecord(
          fastify.libp2p,
          fastify.ipns,
          request.params.keyName,
          request.params.cid,
        )

        return ipnsRecord
      },
    },
  )

  // Create a new key
  fastify.post<{ Querystring: { name: string } }>('/keys', {
    schema: {
      querystring: {
        name: {
          type: 'string',
          minLength: 3,
        },
      },
    },
    handler: async (request, reply) => {
      const key = await fastify.libp2p.keychain.createKey(
        request.query.name,
        'Ed25519',
      )

      return key
    },
  })
}

export default ipnsPlugin
