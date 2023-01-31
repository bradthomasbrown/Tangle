import { Wallet } from 'ethers'
import { Cluster } from '../../classes/index.mjs'
import { AddressZero } from '@ethersproject/constants'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle, router } = chain.contracts
let A = chain.wallet.address
let B = Wallet.createRandom().address

// transfer init
assert.equal((await tangle.balanceOf(A)).toString(), '100000000000000000', 'transfer init balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '0', 'transfer init balanceOf B')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '100000000000000000', 'transfer init hold points A')
assert.equal((await tangle.accounts('hold', B)).P.toString(), '0', 'transfer init hold points B')
assert.equal((await tangle.farms('hold')).P.toString(), '100000000000000000', 'transfer init hold points')

// transfer 1E16 from A to B
await (await tangle.transfer(B, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '90000000000000000', 'A to B balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '10000000000000000', 'A to B balanceOf B')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '90000000000000000', 'A to B hold points A')
assert.equal((await tangle.accounts('hold', B)).P.toString(), '10000000000000000', 'A to B hold points B')
assert.equal((await tangle.farms('hold')).P.toString(), '100000000000000000', 'A to B hold points')

// transfer 1E16 from A to zero
await (await tangle.transfer(AddressZero, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '80000000000000000', 'A to 0 hold balanceOf A')
assert.equal((await tangle.balanceOf(AddressZero)).toString(), '10000000000000000', 'A to 0 balanceOf 0')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '80000000000000000', 'A to 0 hold points A')
assert.equal((await tangle.accounts('hold', AddressZero)).P.toString(), '0', 'A to 0 hold points 0')
assert.equal((await tangle.farms('hold')).P.toString(), '90000000000000000', 'A to 0 hold points')

// transfer 1E16 from A to router
await (await tangle.transfer(router.address, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '70000000000000000', 'A to router hold balanceOf A')
assert.equal((await tangle.balanceOf(router.address)).toString(), '10000000000000000', 'A to router balanceOf router')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '70000000000000000', 'A to router hold points A')
assert.equal((await tangle.accounts('hold', router.address)).P.toString(), '0', 'A to router hold points router')
assert.equal((await tangle.farms('hold')).P.toString(), '80000000000000000', 'A to router hold points')

// transfer 1E16 from A to tangle
await (await tangle.transfer(tangle.address, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '60000000000000000', 'A to tangle hold balanceOf A')
assert.equal((await tangle.balanceOf(tangle.address)).toString(), '910000000000000000', 'A to tangle hold balanceOf tangle')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '60000000000000000', 'A to tangle hold points A')
assert.equal((await tangle.accounts('hold', tangle.address)).P.toString(), '0', 'A to tangle hold points tangle')
assert.equal((await tangle.farms('hold')).P.toString(), '70000000000000000', 'A to tangle hold points')

// transfer 1E16 from A to self
await (await tangle.transfer(A, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '60000000000000000', 'A to A hold balanceOf A')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '60000000000000000', 'A to A hold points A')
assert.equal((await tangle.farms('hold')).P.toString(), '70000000000000000', 'A to A hold points')

// transfer remainder of A to B
await (await tangle.transfer(B, 60000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '1', 'final balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '69999999999999999', 'final balanceOf B')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '1', 'final hold points A')
assert.equal((await tangle.accounts('hold', B)).P.toString(), '69999999999999999', 'final hold points B')
assert.equal((await tangle.farms('hold')).P.toString(), '70000000000000000', 'final hold points')

// attempt transfer more than balance
assert.equal(await (await tangle.transfer(B, 2, { gasPrice: 0, gasLimit: 500000 })).wait().catch((reason: any) => { return reason }) instanceof Error, true)

// cluster.kill()