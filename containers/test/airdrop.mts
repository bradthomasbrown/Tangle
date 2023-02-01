import { Wallet } from 'ethers'
import { Cluster } from '../../classes/index.mjs'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle } = chain.contracts
let A_wallet = chain.wallet
let A = A_wallet.address

// init
let a_bal = await tangle.balanceOf(A)
assert.equal(a_bal.toString(), '100000000000000000', 'balanceOf A init 100000000000000000')
assert.equal((await tangle.accounts('hold', A)).P.toString(), '100000000000000000', 'hold points A init 100000000000000000')
assert.equal((await tangle.accounts('airdrop', A)).P.toString(), '0', 'airdrop points A init 0')
let aa = await tangle.airdropAmount()
assert.equal(aa.toString(), '1000000000', 'airdropAmount 1e9')

// 1 person airdrop x 10
for (let i = 0; i < 10; i++) {
    let r = Wallet.createRandom().address
    let tx = await (await tangle.airdrop([r], { gasPrice: 0, gasLimit: 500000 })).wait()
    assert.equal((await tangle.balanceOf(A)).toString(), a_bal.sub(aa.mul(i + 1)).toString(), `balanceOf A a_bal - ${i} * aa`)
    assert.equal((await tangle.balanceOf(r)).toString(), aa.toString(), `balanceOf r aa`)
    assert.equal((await tangle.accounts('airdrop', A)).P.toString(), (i + 1).toString(), `airdrop points of A should be ${i}`)
    assert.equal((await tangle.accounts('hold', A)).P.toString(), a_bal.sub(aa.mul(i + 1)).toString(), `hold points A a_bal - ${i} * aa`)
    assert.equal((await tangle.accounts('hold', r)).P.toString(), aa.toString(), 'hold points r aa')
    console.log(tx.cumulativeGasUsed.toString())
}

// 10 person airdrop
let rs = []
for (let i = 0; i < 10; i++) rs.push(Wallet.createRandom().address)
let tx = await (await tangle.airdrop(rs, { gasPrice: 0, gasLimit: 2000000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), a_bal.sub(aa.mul(10 + 10)).toString(), `balanceOf A a_bal - ${10 + 10} * aa`)
assert.equal((await tangle.accounts('airdrop', A)).P.toString(), (10 + 10).toString(), `airdrop points of A should be ${10 + 10}`)
assert.equal((await tangle.accounts('hold', A)).P.toString(), a_bal.sub(aa.mul(10 + 10)).toString(), `hold points A a_bal - ${10 + 10} * aa`)
for (let i = 0; i < 10; i++) {
    assert.equal((await tangle.balanceOf(rs[i])).toString(), aa.toString(), `balanceOf r aa`)
    assert.equal((await tangle.accounts('hold', rs[i])).P.toString(), aa.toString(), 'hold points r aa')
}
console.log(tx.cumulativeGasUsed.toString())

// 50 person airdrop
rs = []
for (let i = 0; i < 50; i++) rs.push(Wallet.createRandom().address)
tx = await (await tangle.airdrop(rs, { gasPrice: 0, gasLimit: 5000000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), a_bal.sub(aa.mul(50 + 20)).toString(), `balanceOf A a_bal - ${1500 + 20} * aa`)
assert.equal((await tangle.accounts('airdrop', A)).P.toString(), (50 + 20).toString(), `airdrop points of A should be ${50 + 20}`)
assert.equal((await tangle.accounts('hold', A)).P.toString(), a_bal.sub(aa.mul(50 + 20)).toString(), `hold points A a_bal - ${50 + 20} * aa`)
for (let i = 0; i < 50; i++) {
    assert.equal((await tangle.balanceOf(rs[i])).toString(), aa.toString(), `balanceOf r aa`)
    assert.equal((await tangle.accounts('hold', rs[i])).P.toString(), aa.toString(), 'hold points r aa')
}
console.log(tx.cumulativeGasUsed.toString())

// // listen for Airdrop event
// tangle.once('Airdrop', (airdropper, recipients) => { console.log(airdropper, recipients) })


cluster.kill()