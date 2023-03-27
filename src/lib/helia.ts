import { LevelDatastore } from 'datastore-level'
import { CID } from 'multiformats'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createLibp2p, Libp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { createHelia } from 'helia'
import type { Helia } from '@helia/interface'
import { unixfs } from '@helia/unixfs'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'

export async function startHelia(): Promise<{
  helia: Helia
  libp2p: Libp2p
}> {

  // application-specific data lives in the datastore
  const datastore = new LevelDatastore(`${process.env.DATA_DIR}/data`)
  const libp2p = await createLibp2p({
    datastore,
    dht: kadDHT({
      // validators: {
      //   ipns: ipnsValidator,
      // },
      // selectors: {
      //   ipns: ipnsSelector,
      // },
    }),
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
    }),
    peerDiscovery: [
      bootstrap({
        list: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
        ],
      }),
    ],
  })

  // const blockstore = new LevelDatastore(`${process.env.DATA_DIR}/data`)

  // create a Helia node
  const helia = await createHelia({
    blockstore: new MemoryBlockstore(),
    datastore,
    libp2p,
  })

  // setInterval(() => {
  //   const peers = libp2p.getPeers()
  //   console.log(peers)
  // }, 5000)



  return { helia, libp2p }
}
