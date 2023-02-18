import { providers, Wallet } from 'ethers5'
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
let B = Wallet.createRandom().address

// listen for Transfer events
let transferEventCount = 0
let promise = new Promise(resolve => {
    tangle.on('Transfer', async (_from, _to, _value, event) => {
        let { transactionHash, blockNumber } = event
        let tx = await chain.provider.getTransaction(transactionHash)
        let result = await tx.wait()
        let { cumulativeGasUsed } = result
        console.log(blockNumber, String(cumulativeGasUsed))
        transferEventCount++;
        if (++transferEventCount == 8) {
            resolve(null)
            tangle.removeAllListeners()
        }
    })
})

// transfer init
assert.equal((await tangle.balanceOf(A)).toString(), '100000000000000000', 'transfer init balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '0', 'transfer init balanceOf B')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '0', 'transfer init hold points A')
assert.equal((await tangle.accs(FarmID.HOLD, B)).points.toString(), '0', 'transfer init hold points B')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '0', 'transfer init hold points')

// updateHoldAcc A, attempt updateHoldAcc tangle.address
await (await tangle.updateHoldAcc([A, tangle.address], { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'init A updateHoldAcc')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).points.toString(), '0', 'init tangle.address updateHoldAcc')

// transfer 1E16 from A to B
await (await tangle.transfer(B, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '90000000000000000', 'A to B balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '10000000000000000', 'A to B balanceOf B')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'A to B hold points A')
assert.equal((await tangle.accs(FarmID.HOLD, B)).points.toString(), '0', 'A to B hold points B')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '100000000000000000', 'A to B hold points')

// transfer 1E16 from A to zero
await (await tangle.transfer(AddressZero, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '80000000000000000', 'A to 0 hold balanceOf A')
assert.equal((await tangle.balanceOf(AddressZero)).toString(), '10000000000000000', 'A to 0 balanceOf 0')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'A to 0 hold points A')
assert.equal((await tangle.accs(FarmID.HOLD, AddressZero)).points.toString(), '0', 'A to 0 hold points')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '100000000000000000', 'A to 0 hold points')

// transfer 1E16 from A to router
await (await tangle.transfer(router.address, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '70000000000000000', 'A to router hold balanceOf A')
assert.equal((await tangle.balanceOf(router.address)).toString(), '10000000000000000', 'A to router balanceOf router')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'A to router hold points A')
assert.equal((await tangle.accs(FarmID.HOLD, router.address)).points.toString(), '0', 'A to router hold points router')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '100000000000000000', 'A to router hold points')

// updateHoldAcc B
await (await tangle.updateHoldAcc([B], { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'A mid updateHoldAcc')
assert.equal((await tangle.accs(FarmID.HOLD, B)).points.toString(), '10000000000000000', 'B mid updateHoldAcc')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '110000000000000000', 'mid hold points')

// transfer 1E16 from A to tangle
await (await tangle.transfer(tangle.address, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '60000000000000000', 'A to tangle hold balanceOf A')
assert.equal((await tangle.balanceOf(tangle.address)).toString(), '910000000000000000', 'A to tangle hold balanceOf tangle')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'A to tangle hold points A')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).points.toString(), '0', 'A to tangle hold points tangle')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '110000000000000000', 'A to tangle hold points')
assert.equal((await tangle.farms(FarmID.HOLD)).gen.maxValue.toString(), '225000000000000000', 'A to tangle generator M')

// transfer 1E16 from A to self
await (await tangle.transfer(A, 10000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '60000000000000000', 'A to A hold balanceOf A')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'A to A hold points A')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '110000000000000000', 'A to A hold points')

// transfer remainder of A to B
await (await tangle.transfer(B, 60000000000000000n, { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), '1', 'final balanceOf A')
assert.equal((await tangle.balanceOf(B)).toString(), '69999999999999999', 'final balanceOf B')
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '100000000000000000', 'final hold points A')
assert.equal((await tangle.accs(FarmID.HOLD, B)).points.toString(), '10000000000000000', 'final hold points B')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '110000000000000000', 'final hold points')

// updateHoldAcc A, B
await (await tangle.updateHoldAcc([A, B], { gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.toString(), '1', 'final udpateHoldAcc A')
assert.equal((await tangle.accs(FarmID.HOLD, B)).points.toString(), '69999999999999999', 'final udpateHoldAcc B')
assert.equal((await tangle.farms(FarmID.HOLD)).points.toString(), '70000000000000000', 'final udpateHoldAcc points')

// payGens
await (await tangle.payGens({ gasPrice: 0, gasLimit: 500000 })).wait()
assert.equal((await tangle.farms(FarmID.HOLD)).gen.maxValue.toString(), '227500000000000000', 'payGens 0')
assert.equal((await tangle.farms(FarmID.AIRDROP)).gen.maxValue.toString(), '227500000000000000', 'payGens 1')
assert.equal((await tangle.farms(FarmID.STAKE)).gen.maxValue.toString(), '227500000000000000', 'payGens 2')
assert.equal((await tangle.farms(FarmID.MINE)).gen.maxValue.toString(), '227500000000000000', 'payGens 3')


// // listen for 8 Transfer events
// let i = 0; await new Promise(resolve => tangle.on('Transfer', (from, to, value) => { console.log(from, to, value.toString()); if(++i >= 8) resolve(null) }))
// tangle.removeAllListeners('Transfer')

// attempt transfer more than balance
assert.equal(await (await tangle.transfer(B, 2, { gasPrice: 0, gasLimit: 500000 })).wait().catch((reason: any) => { return reason }) instanceof Error, true)

await promise

cluster.kill()