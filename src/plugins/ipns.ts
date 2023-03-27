import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { publishRecord } from '../lib/ipns.js'
import { CID, Version } from 'multiformats'
import { base36 } from 'multiformats/bases/base36'
import { peerIdFromString } from '@libp2p/peer-id'
import { base32 } from 'multiformats/bases/base32'

// Plugin for IPNS specific routes
const ipnsPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/ipns/names', async (request, reply) => {
    let keychainKeys = await fastify.libp2p.keychain.listKeys()

    // Create an array of the local keys, their label, and their CID representation
    let keys = keychainKeys.map((k) => {
      const peer = peerIdFromString(k.id)
      return {
        keyName: k.name,
        peerId: peer,
        nameb36: peer.toCID().toString(base36),
      }
    })

    // resolve the name locally to see if they have an associated IPNS record
    const names = await Promise.allSettled(
      // ipnsLocal will only resolve locally and will reject the promise if there's no record
      keys.map((p) => fastify.ipnsLocal.resolve(p.peerId)),
    )

    // Merge the keys and names array into one
    return keys.reduce((acc: {}[], cur, idx) => {
      const curName = names[idx]
      if (curName.status === 'fulfilled') {
        // a record has been resolved locally
        acc.push({ ...cur, ipnsValue: curName.value.toV1().toString() })
      } else {
        // the key has no published ipns record
        acc.push({ ...cur })
      }
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

        return ipnsRecord.toString()
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
