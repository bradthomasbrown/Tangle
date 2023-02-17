import { Wallet } from 'ethers5'
import { Cluster } from '../../classes/index.mjs'
import { AddressZero } from '@ethersproject/constants'
import assert from 'node:assert/strict'

enum FarmID {
    HOLD,
    AIRDROP,
    STAKE,
    MINE,
}

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle, router } = chain.contracts
let A = chain.wallet.address
let B_wallet = Wallet.createRandom().connect(chain.provider)
let B = B_wallet.address

// transfer init
assert.equal((await tangle.balanceOf(A)).toString(), '100000000000000000', 'transfer init balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '0', 'transfer init balanceOf B')

// approve B to spend A
await (await tangle.approve(B, 120000000000000000n, { gasPrice: 0 }))
assert.equal((await tangle.allowance(A, B)).toString(), '120000000000000000', 'allowance A B')

// use tangle now from context of B
tangle = tangle.connect(B_wallet)

// transfer 1E16 from A to B
await (await tangle.transferFrom(A, B, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '90000000000000000', 'A to B balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '10000000000000000', 'A to B balanceOf B')
assert.equal((await tangle.allowance(A, B)).toString(), '110000000000000000', 'A to B allowance A B')

// transfer 1E16 from A to zero
await (await tangle.transferFrom(A, AddressZero, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '80000000000000000', 'A to 0 hold balanceOf A')
assert.equal((await tangle.balanceOf(AddressZero)).toString(), '10000000000000000', 'A to 0 balanceOf 0')
assert.equal((await tangle.allowance(A, B)).toString(), '100000000000000000', 'A to 0 allowance A B')

// transfer 1E16 from A to router
await (await tangle.transferFrom(A, router.address, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '70000000000000000', 'A to router hold balanceOf A')
assert.equal((await tangle.balanceOf(router.address)).toString(), '10000000000000000', 'A to router balanceOf router')
assert.equal((await tangle.allowance(A, B)).toString(), '90000000000000000', 'A to router allowance A B')

// transfer 1E16 from A to tangle
await (await tangle.transferFrom(A, tangle.address, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '60000000000000000', 'A to tangle hold balanceOf A')
assert.equal((await tangle.balanceOf(tangle.address)).toString(), '910000000000000000', 'A to tangle hold balanceOf tangle')
assert.equal((await tangle.allowance(A, B)).toString(), '80000000000000000', 'A to tangle allowance A B')

// attempt to transfer more than balance, within allowance
assert.equal(await (await tangle.transferFrom(A, B, 65000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait().catch((reason: any) => { return reason }) instanceof Error, true, 'transfer more than balance, within allowance')

// transfer 1E16 from A to self
await (await tangle.transferFrom(A, A, 30000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '60000000000000000', 'A to A hold balanceOf A')
assert.equal((await tangle.allowance(A, B)).toString(), '50000000000000000', 'A to A allowance A B')

// // listen for 8 Transfer events
// let i = 0; await new Promise(resolve => tangle.on('Transfer', (from, to, value) => { console.log(from, to, value.toString()); if(++i >= 8) resolve(null) }))
// tangle.removeAllListeners('Transfer')

// attempt to transfer more than allowed, within balance
assert.equal(await (await tangle.transferFrom(A, B, 55000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait().catch((reason: any) => { return reason }) instanceof Error, true, 'transfer more than allowance, within balance')

cluster.kill()