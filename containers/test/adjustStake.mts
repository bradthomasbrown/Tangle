import { Contract } from 'ethers5'
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

console.log('creating liquidityPool')
// create liquidity init
await drink.bind(chain)(A, '1')
let amountTokenDesired = await tangle.balanceOf(A)
let deadline = () => parseInt(String((Date.now() + 60) / 1000))
await (await tangle.approve(router.address, amountTokenDesired, { gasPrice: 0 })).wait()
// if the addLiquidityETH fails, run the below code, and check output with copmiler/Dockerfile init code hash line, could be a mismatch
// console.log(await chain.contracts['factory'].initCodeHash())
await (await router.addLiquidityETH(tangle.address, await tangle.balanceOf(A), 0, 0, A, deadline(), { gasPrice: 0, value: parseEther('1'), gasLimit: 5000000 })).wait()
let pair: string = await new Promise(resolve => factory.once('PairCreated', (_token0, _token1, pair) => resolve(pair)))
let liquidity = new Contract(pair, tangle.interface, A_wallet)
await (await tangle.setLiquidityPool(liquidity.address, { gasPrice: 0 })).wait()
assert.equal((await provider.getBalance(A)).toString(), '0', 'A native balance not 0')
assert.equal((await tangle.balanceOf(A)).toString(), '1', 'A tangle not at minBal')
assert.equal(await tangle.liquidityPool(), liquidity.address, 'tangle.liquidity address not liquidity.address')
assert.equal((await liquidity.balanceOf(A)).toString() != '0', true, 'liquidity balanceOf A should not be zero')
assert.equal((await tangle.accs(FarmID.STAKE, A)).points.toString(), '0', 'stake points of A should be 0')
assert.equal((await tangle.farms(FarmID.STAKE)).points.toString(), '0', 'stake points should be 0')

console.log('positive adjustStake')
// positive adjust stake
let l_bal = await liquidity.balanceOf(A)
await (await liquidity.approve(tangle.address, l_bal, { gasPrice: 0 })).wait()
await (await tangle.adjustStake(l_bal, { gasPrice: 0 })).wait()
assert.equal((await liquidity.balanceOf(A)).toString(), '0', 'liquidity balanceOf A should 0')
assert.equal((await liquidity.balanceOf(tangle.address)).toString(), l_bal.toString(), 'liquidity balanceOf tangle should be l_bal')
assert.equal((await tangle.accs(FarmID.STAKE, A)).points.toString(), l_bal.toString(), 'stake points of A should be l_bal')
assert.equal((await tangle.farms(FarmID.STAKE)).points.toString(), l_bal.toString(), 'stake points should be l_bal')

console.log('zero adjustStake')
// zero adjust stake
await (await tangle.adjustStake(0, { gasPrice: 0 })).wait()
assert.equal((await liquidity.balanceOf(A)).toString(), '0', 'liquidity balanceOf A should still be 0')
assert.equal((await liquidity.balanceOf(tangle.address)).toString(), l_bal.toString(), 'liquidity balanceOf tangle should still be l_bal')
assert.equal((await tangle.accs(FarmID.STAKE, A)).points.toString(), l_bal.toString(), 'stake points of A should still be l_bal')
assert.equal((await tangle.farms(FarmID.STAKE)).points.toString(), l_bal.toString(), 'stake points should still be l_bal')

console.log('negative adjustStake')
// negative adjust stake
await (await tangle.adjustStake(l_bal.mul(-1), { gasPrice: 0 })).wait()
assert.equal((await liquidity.balanceOf(A)).toString(), l_bal.toString(), 'liquidity balanceOf A should be l_bal')
assert.equal((await liquidity.balanceOf(tangle.address)).toString(), '0', 'liquidity balanceOf tangle should be 0')
assert.equal((await tangle.accs(FarmID.STAKE, A)).points.toString(), '0', 'stake points of A should be 0')
assert.equal((await tangle.farms(FarmID.STAKE)).points.toString(), '0', 'stake points should be 0')

// // listen for AdjustStake event
// await new Promise(resolve => tangle.once('AdjustStake', (staker, amount) => { console.log(staker, amount.toString()); resolve(null) }))

// let g = (t: BigNumber) => M.sub(C.add(Tc).sub(Tp).mul(M.sub(R)).div(t.add(C).sub(Tp))).mul(N).div(D)
// for (let i = 0; i < 10; i++) {
//     await new Promise(_ => setTimeout(_, 1000))
//     await (await tangle.transfer(A, 1, { gasLimit: 250000, gasPrice: 0 })).wait()
//     let results = await tangle.available(A, ['hold'])
//     console.log(results)
// }



cluster.kill()