import { IPNS } from '@helia/ipns'
import { CID } from 'multiformats'

import { Libp2p } from 'libp2p'
import { wait } from './utils.js'

export async function publishRecord(libp2p: Libp2p, ipns: IPNS) {
  // create a public key to publish as an IPNS name
  const keyInfo = await libp2p.keychain.createKey(
    `test-${Date.now()}`,
    'Ed25519',
  )
  const peerId = await libp2p.keychain.exportPeerId(keyInfo.name)

  const cidOfImg = CID.parse(
    'bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4',
  )
  // publish the name
  return await ipns.publish(peerId, cidOfImg, {
    onProgress(evt) {
      console.log(evt)
    },
  })
}
