import { LevelDatastore } from 'datastore-level'
import { CID } from 'multiformats'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { createHelia } from 'helia'
import { ipns, ipnsValidator, ipnsSelector } from '@helia/ipns'
import { dht, pubsub } from '@helia/ipns/routing'
import { unixfs } from '@helia/unixfs'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import { wait } from './src/utils.js'
import * as dotenv from 'dotenv'

dotenv.config()

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

// create a Helia node
const helia = await createHelia({
  blockstore: new MemoryBlockstore(),
  datastore,
  libp2p,
})

const name = ipns(helia, [dht(helia), pubsub(helia)])

// create a public key to publish as an IPNS name
const keyInfo = await helia.libp2p.keychain.createKey(
  `test-${Date.now()}`,
  'Ed25519',
)
const peerId = await helia.libp2p.keychain.exportPeerId(keyInfo.name)

const cidOfImg = CID.parse(
  'bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4',
)

setInterval(() => {
  const peers = libp2p.getPeers()
  console.log(peers)
}, 5000)

await wait(30)
// publish the name
await name.publish(peerId, cidOfImg, {
  onProgress(evt) {
    console.log(evt)
  },
})
