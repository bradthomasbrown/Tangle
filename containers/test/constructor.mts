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
let { tangle } = chain.contracts;

// listen for Transfer events
let transferEventCount = 0
let promise = new Promise(resolve => {
    tangle.on('Transfer', (_from, _to, _value, event) => {
        console.log(event);
        transferEventCount++;
        if (++transferEventCount == 2) {
            resolve(null)
            tangle.removeAllListeners()
        }
    })
})

// ERC20 inits
assert.equal(await tangle.name(), 'Tangle')
assert.equal(await tangle.symbol(), 'TNGL')
assert.equal((await tangle.decimals()).toString(), '9')
assert.equal((await tangle.totalSupply()).toString(), '1000000000000000000')

// generator inits
for (let id in FarmID) {
    if (isNaN(Number(id))) continue
    let farm = await tangle.farms(id)
    let { gen, sigma, points, reward } = farm
    let { maxValue, timeScaler, t1, t2, valueScaler } = gen
    let genReward = gen.reward
    assert.equal(String(maxValue), '225000000000000000', `${id}.gen.maxValue`)
    assert.equal(String(timeScaler), '14016000', `${id}.gen.timeScaler`)
    assert.equal(String(t1) != '0', true, `${id}.gen.t1 != 0`)
    assert.equal(String(t2), String(t1), `${id}.gen.t2 == t1`)
    assert.equal(String(valueScaler), '100000000000000000000000000000000', `${id}.gen.valueScaler`)
    assert.equal(String(genReward), '0', `${id}.gen.reward`)
    assert.equal(String(sigma), '0', `${id}.sigma`)
    let expectedFarmPoints = id == String(FarmID.HOLD) ? '0' : '0'
    assert.equal(String(points), expectedFarmPoints, `${id}.points`)
    assert.equal(String(reward), '0', `${id}.reward`)
}

// Tangle inits
assert.equal(await tangle.owner(), chain.wallet.address)
assert.equal((await tangle.minBal()).toString(), '1')
assert.equal((await tangle.airdropAmount()).toString(), '1000000000')

// chain.wallet.address caller check
assert.equal((await tangle.balanceOf(chain.wallet.address)).toString(), '100000000000000000')
assert.equal((await tangle.accs(FarmID.HOLD, chain.wallet.address)).reward.toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, chain.wallet.address)).points.toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, chain.wallet.address)).sigma.toString(), '0')

// tangle check
assert.equal((await tangle.balanceOf(tangle.address)).toString(), '900000000000000000')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).reward.toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).points.toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).sigma.toString(), '0')

// AddressZero check
assert.equal((await tangle.balanceOf(AddressZero)).toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).reward.toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).points.toString(), '0')
assert.equal((await tangle.accs(FarmID.HOLD, tangle.address)).sigma.toString(), '0')

// wait for transfer events from constructor
await promise

cluster.kill()