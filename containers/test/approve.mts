import { Cluster } from '../../classes/index.mjs'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle, router } = chain.contracts;

// approve
await (await tangle.approve(router.address, 123456, { gasPrice: 0 })).wait()
assert.equal((await tangle.allowance(chain.wallet.address, router.address)).toString(), '123456')

cluster.kill()