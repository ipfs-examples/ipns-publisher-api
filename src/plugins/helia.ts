import { startHelia } from '../lib/helia.js'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Libp2p } from 'libp2p'
import { Helia } from '@helia/interface'
import statusPlugin from './status.js'
import ipnsPlugin from './ipns.js'
import {
  ipns as startIPNS,
  ipnsValidator,
  ipnsSelector,
  IPNS,
} from '@helia/ipns'
import { dht, pubsub } from '@helia/ipns/routing'

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyInstance {
    helia: Helia
    libp2p: Libp2p
    ipns: IPNS
    ipnsLocal: IPNS
  }
}

// define plugin using promises
const heliaPlugin: FastifyPluginAsync = async (fastify, options) => {
  const { helia, libp2p } = await startHelia()

  const ipns = startIPNS(helia, [dht(helia), pubsub(helia)])
  const ipnsLocal = startIPNS(helia)

  fastify.decorate('libp2p', libp2p)
  fastify.decorate('helia', helia)
  fastify.decorate('ipns', ipns)
  fastify.decorate('ipnsLocal', ipnsLocal)

  fastify.register(statusPlugin)
  fastify.register(ipnsPlugin)
}

export default fp(heliaPlugin)
