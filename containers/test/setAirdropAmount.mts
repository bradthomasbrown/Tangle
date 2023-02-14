import { Wallet } from 'ethers5'
import { Cluster } from '../../classes/index.mjs'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let provider = chain.provider
let { tangle } = chain.contracts

await (await tangle.setAirdropAmount(100, { gasPrice: 0 })).wait()
assert.equal('100', (await tangle.airdropAmount()).toString(), 'airdropAmount not correctly set')

let B_wallet = Wallet.createRandom().connect(provider)
tangle = tangle.connect(B_wallet)
assert.equal(await tangle.setAirdropAmount(50, { gasPrice: 0 }).catch((reason: any) => { return reason }) instanceof Error, true, 'unauthorized airdropAmount set did not fail')

cluster.kill()