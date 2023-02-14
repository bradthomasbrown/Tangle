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

for (let i = 0; i < 10; i++) {
    let r = Wallet.createRandom().address
    await (await tangle.setLiquidity(r, { gasPrice: 0 })).wait()
    assert.equal(r, await tangle.liquidity(), 'liquidity not correctly set')
}
let r = Wallet.createRandom().address
let B_wallet = Wallet.createRandom().connect(provider)
tangle = tangle.connect(B_wallet)
assert.equal(await tangle.setLiquidity(r, { gasPrice: 0 }).catch((reason: any) => { return reason }) instanceof Error, true, 'unauthorized liquidity set did not fail')

cluster.kill()