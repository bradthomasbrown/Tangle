import { BigNumber, Contract, Wallet } from 'ethers'
import { Cluster } from '../../classes/index.mjs'
import assert from 'node:assert/strict'
import { drink } from '../../functions/drink.mjs'
import { parseEther } from 'ethers/lib/utils.js'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let provider = chain.provider
let { tangle, router, factory } = chain.contracts
let A_wallet = chain.wallet
let A = A_wallet.address

// get generator init vars and stake
let { M, C, R, Tp, Tc, D } : { [key: string]: BigNumber } = await (tangle.generator())
let g = (t: BigNumber, N: BigNumber) => M.sub(C.add(Tc).sub(Tp).mul(M.sub(R)).div(t.add(C).sub(Tp))).mul(N).div(D)
let N_stake = (await tangle.farms('stake')).N
let N_hold = (await tangle.farms('hold')).N
let N_airdrop = (await tangle.farms('airdrop')).N
let N_gentlemidnight = (await tangle.farms('GentleMidnight')).N

let e_airdrop = new Promise(resolve => tangle.once('Airdrop', (_sender, _recipients, event) => resolve(event)))
let e_paircreated = new Promise(resolve => factory.once('PairCreated', (_token0, _token1, pair, _count, event) => resolve([pair, event])))
let e_claim = new Promise(resolve => tangle.once('Claim', (_claimer, _names, event) => resolve(event)))
await tangle.update({ gasPrice: 0 })
await new Promise(_ => setTimeout(_, 3000))

// airdrop 
await (await tangle.airdrop([Wallet.createRandom().address], { gasPrice: 0, gasLimit: 500000 })).wait()
console.log('airdrop complete')

await new Promise(_ => setTimeout(_, 3000))

// create liquidity init
await drink.bind(chain)('1')
let amountTokenDesired = (await tangle.balanceOf(A)).div(2)
let deadline = () => parseInt(String((Date.now() + 60) / 1000))
await (await tangle.approve(router.address, amountTokenDesired, { gasPrice: 0 })).wait()
// if the addLiquidityETH fails, run the below code, and check output with copmiler/Dockerfile init code hash line, could be a mismatch
// console.log(await chain.contracts['factory'].initCodeHash())
await (await router.addLiquidityETH(tangle.address, amountTokenDesired, 0, 0, A, deadline(), { gasPrice: 0, value: parseEther('1'), gasLimit: 5000000 })).wait()
let pair: string = (await e_paircreated)[0]
let liquidity = new Contract(pair, tangle.interface, A_wallet)
await (await tangle.setLiquidity(liquidity.address, { gasPrice: 0 })).wait()
console.log('liquidity pool create complete')

// positive adjust stake
let l_bal = await liquidity.balanceOf(A)
await (await liquidity.approve(tangle.address, l_bal, { gasPrice: 0 })).wait()
await (await tangle.adjustStake(l_bal, { gasPrice: 0 })).wait()
console.log('positive stake complete')

// have nonzero points in all categories
assert.equal((await tangle.accounts('hold', A)).P.gt(0), true, 'A hold points gt 0')
assert.equal((await tangle.accounts('airdrop', A)).P.gt(0), true, 'A airdrop points gt 0')
assert.equal((await tangle.accounts('stake', A)).P.gt(0), true, 'A stake points gt 0')
console.log('nonzero point test complete')

await new Promise(_ => setTimeout(_, 5000))

// hold claim test
let pBal = await tangle.balanceOf(A)
await (await tangle.claim(['hold'], { gasPrice: 0 }))
let t1 = BigNumber.from((await provider.getBlock((await e_airdrop)['blockNumber'])).timestamp.toString())
let t2 = BigNumber.from((await provider.getBlock((await e_paircreated)[1]['blockNumber'])).timestamp.toString())
let t3 = BigNumber.from((await provider.getBlock((await e_claim)['blockNumber'])).timestamp.toString())
let r1 = g(t1, N_hold)
let r2 = g(t2, N_hold).sub(g(t1, N_hold)).mul('99999999000000000').div('100000000000000000')
let r3 = g(t3, N_hold).sub(g(t2, N_hold)).mul(BigNumber.from('99999999000000000').sub(amountTokenDesired)).div(BigNumber.from('100000000000000000').sub(amountTokenDesired))
assert.equal(r1.add(r2).add(r3).sub((await tangle.balanceOf(A)).sub(pBal)).abs().lte(1), true, 'hold claim expected')
console.log('hold claim test complete')

let e_claim2 = new Promise(resolve => tangle.once('Claim', (_claimer, _names, event) => resolve(event)))
await tangle.update({ gasPrice: 0 })
await new Promise(_ => setTimeout(_, 5000))

// stake claim test
pBal = await tangle.balanceOf(A)
await (await tangle.claim(['stake'], { gasPrice: 0 }))
let t4 = BigNumber.from((await provider.getBlock((await e_claim2)['blockNumber'])).timestamp.toString())
let r4 = g(t4, N_stake)
assert.equal(r4.sub((await tangle.balanceOf(A)).sub(pBal)).abs().lte(1), true, 'stake claim expected')
console.log('stake claim test complete')

cluster.kill()