import { IPNS } from '@helia/ipns'
import { CID } from 'multiformats'

import { Libp2p } from 'libp2p'
import { wait } from './utils.js'

export async function getKeys(libp2p: Libp2p) {
  return await libp2p.keychain.listKeys()
}

export const publishRecord = async (
  libp2p: Libp2p,
  ipns: IPNS,
  keyName: string = 'self',
  cid: string = 'bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4',
) => {
  // The IPNS name
  const peerId = await libp2p.keychain.exportPeerId(keyName)

  // The CID to point to
  const parsedCid = CID.parse(cid)
  // publish the name
  return await ipns.publish(peerId, parsedCid, {
    onProgress(evt) {
      if (
        evt.type === 'ipns:routing:dht:error' ||
        evt.type === 'ipns:pubsub:error'
      )
        console.error(evt)
    },
  })
}

export const createKey =
  (libp2p: Libp2p, ipns: IPNS) => async (name: string) => {
    // create a public key to publish as an IPNS name
    return await libp2p.keychain.createKey(name, 'Ed25519')
  }
