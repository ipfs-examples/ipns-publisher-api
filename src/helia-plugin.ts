import { startHelia } from './helia.js'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Libp2p } from 'libp2p'
import { Helia } from '@helia/interface'
import { IPNS } from '@helia/ipns'

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyInstance {
    helia: Helia
    libp2p: Libp2p
    ipns: IPNS
  }
}

// define plugin using promises
const heliaPlugin: FastifyPluginAsync = async (fastify, options) => {
  const { helia, libp2p } = await startHelia()
  fastify.decorate('libp2p', libp2p)
  fastify.decorate('helia', helia)
}

export default fp(heliaPlugin)
