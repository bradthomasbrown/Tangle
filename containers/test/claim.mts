import { BigNumber, Contract, Wallet } from 'ethers5'
import { Cluster } from '../../classes/index.mjs'
import assert from 'node:assert/strict'
import { drink } from '../../functions/drink.mjs'
import { parseEther } from '@ethersproject/units'

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
let provider = chain.provider
let { tangle, router, factory } = chain.contracts
let A_wallet = chain.wallet
let A = A_wallet.address

// get generators
let gens = []
for (let i in FarmID) {
    if (isNaN(Number(i))) continue
    gens.push((await tangle.farms(i)).gen)
}
let g = async (gen: any) => {
    let blockNumber = await provider.getBlockNumber()
    let block = await provider.getBlock(blockNumber)
    let { timestamp } = block
    let { maxValue, timeScaler, t1, t2, reward } = gen
    return maxValue.sub(
            (timeScaler.add(t1).sub(t2))
            .mul(maxValue.sub(reward))
            .div(BigNumber.from(timestamp).add(timeScaler).sub(t2)))
}
// let interval = setInterval(async () => {
//     await (await tangle.transfer(A, 0, { gasLimit: 250000, gasPrice: 0 })).wait()
//     console.log(await g(gens[0]))
// }, 1000)

let e_airdrop = new Promise(resolve => tangle.once('Airdrop', (_sender, _recipients, event) => resolve(event)))
let e_paircreated = new Promise(resolve => factory.once('PairCreated', (_token0, _token1, pair, _count, event) => resolve([pair, event])))
let e_claim = new Promise(resolve => tangle.once('Claim', (_claimer, _names, event) => resolve(event)))
await (await tangle.transfer(A, 0, { gasLimit: 250000, gasPrice: 0 })).wait()
await new Promise(_ => setTimeout(_, 3000))

// airdrop 
await (await tangle.airdrop([Wallet.createRandom().address], { gasPrice: 0, gasLimit: 500000 })).wait()
console.log('airdrop complete')

await new Promise(_ => setTimeout(_, 3000))

// create liquidity init
await drink.bind(chain)(A, '1')
let amountTokenDesired = (await tangle.balanceOf(A)).div(2)
let deadline = () => parseInt(String((Date.now() + 60) / 1000))
await (await tangle.approve(router.address, amountTokenDesired, { gasPrice: 0 })).wait()
// if the addLiquidityETH fails, run the below code, and check output with copmiler/Dockerfile init code hash line, could be a mismatch
// console.log(await chain.contracts['factory'].initCodeHash())
await (await router.addLiquidityETH(tangle.address, amountTokenDesired, 0, 0, A, deadline(), { gasPrice: 0, value: parseEther('1'), gasLimit: 5000000 })).wait()
let pair: string = (await e_paircreated)[0]
let liquidity = new Contract(pair, tangle.interface, A_wallet)
await (await tangle.setLiquidityPool(liquidity.address, { gasPrice: 0 })).wait()
console.log('liquidity pool create complete')

// positive adjust stake
let l_bal = await liquidity.balanceOf(A)
await (await liquidity.approve(tangle.address, l_bal, { gasPrice: 0 })).wait()
await (await tangle.adjustStake(l_bal, { gasPrice: 0 })).wait()
console.log('positive stake complete')

// let interval = setInterval(async () => {
//     await (await tangle.transfer(A, 0, { gasLimit: 250000, gasPrice: 0 })).wait()
//     console.log(String(await g(gens[FarmID.AIRDROP])))
// }, 1000)

// have nonzero points in all categories
assert.equal((await tangle.accs(FarmID.HOLD, A)).points.gt(0), false, 'A hold points gt 0')
assert.equal((await tangle.accs(FarmID.AIRDROP, A)).points.gt(0), true, 'A airdrop points gt 0')
assert.equal((await tangle.accs(FarmID.STAKE, A)).points.gt(0), true, 'A stake points gt 0')
console.log('nonzero point test complete')

await new Promise(_ => setTimeout(_, 5000))

await (await tangle.transfer(A, 0, { gasLimit: 500000, gasPrice: 0 })).wait()
let prevEarned = BigNumber.from(0)
// airdrop claim test
let bBal = await tangle.balanceOf(A)
console.log(`bBal ${bBal}`)
let predictedReward = (await g(gens[FarmID.AIRDROP])).sub(prevEarned)
console.log(`predicted reward ${predictedReward}`)
let avail = await tangle.available(A, [FarmID.AIRDROP])
console.log(`avail A AIRDROP ${avail}`)
await (await tangle.claim([FarmID.AIRDROP], { gasPrice: 0 })).wait()
let aBal = await tangle.balanceOf(A)
console.log(`aBal ${aBal}`)
let delta = aBal.sub(bBal)
console.log(`delta ${delta}`)
prevEarned = prevEarned.add(delta)

await new Promise(_ => setTimeout(_, 3000))

{
await (await tangle.transfer(A, 0, { gasLimit: 500000, gasPrice: 0 })).wait()
// airdrop claim test
let bBal = await tangle.balanceOf(A)
console.log(`bBal ${bBal}`)
let predictedReward = (await g(gens[FarmID.AIRDROP])).sub(prevEarned)
console.log(`predicted reward ${predictedReward}`)
let avail = await tangle.available(A, [FarmID.AIRDROP])
console.log(`avail A AIRDROP ${avail}`)
await (await tangle.claim([FarmID.AIRDROP], { gasPrice: 0 })).wait()
let aBal = await tangle.balanceOf(A)
console.log(`aBal ${aBal}`)
let delta = aBal.sub(bBal)
console.log(`delta ${delta}`)
prevEarned = prevEarned.add(delta)
}

let balanceOfA = await tangle.balanceOf(A)
console.log(`balanceOfA ${balanceOfA}`)
await (await tangle.transfer(A, 0, { gasLimit: 500000, gasPrice: 0 })).wait()
console.log(await tangle.available(A, [FarmID.HOLD]))
await (await tangle.updateHoldAcc(A, { gasLimit: 500000, gasPrice: 0 })).wait()
for (let i = 0; i < 5; i++) {
    await new Promise(_ => setTimeout(_, 1000))
    await (await tangle.transfer(A, 0, { gasLimit: 500000, gasPrice: 0 })).wait()
    console.log(String(await tangle.available(A, [FarmID.HOLD])))
}
let B = Wallet.createRandom().address
await (await tangle.transfer(B, balanceOfA.mul(2).div(3), { gasLimit: 500000, gasPrice: 0})).wait()
await (await tangle.updateHoldAcc(A, { gasLimit: 500000, gasPrice: 0 })).wait()
await (await tangle.updateHoldAcc(B, { gasLimit: 500000, gasPrice: 0 })).wait()
for (let i = 0; i < 5; i++) {
    await new Promise(_ => setTimeout(_, 1000))
    await (await tangle.transfer(A, 0, { gasLimit: 500000, gasPrice: 0 })).wait()
    console.log(String(await tangle.available(A, [FarmID.HOLD])))
}

// assert.equal(r1.add(r2).add(r3).sub((await tangle.balanceOf(A)).sub(pBal)).abs().lte(1), true, 'hold claim expected')
console.log('hold claim test complete')

cluster.kill()