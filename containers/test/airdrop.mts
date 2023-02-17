import { Wallet } from 'ethers5'
import { Cluster } from '../../classes/index.mjs'
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
let { tangle } = chain.contracts
let A_wallet = chain.wallet
let A = A_wallet.address

// init
let a_bal = await tangle.balanceOf(A)
assert.equal(a_bal.toString(), '100000000000000000', 'balanceOf A init 100000000000000000')
assert.equal((await tangle.accs(FarmID.AIRDROP, A)).points.toString(), '0', 'airdrop points A init 0')
let aa = await tangle.airdropAmount()
assert.equal(aa.toString(), '1000000000', 'airdropAmount 1e9')

// 1 person airdrop x 10
for (let i = 0; i < 10; i++) {
    let r = Wallet.createRandom().address
    let tx = await (await tangle.airdrop([r], { gasPrice: 0, gasLimit: 500000 })).wait()
    assert.equal((await tangle.balanceOf(A)).toString(), a_bal.sub(aa.mul(i + 1)).toString(), `balanceOf A a_bal - ${i} * aa`)
    assert.equal((await tangle.balanceOf(r)).toString(), aa.toString(), `balanceOf r aa`)
    assert.equal((await tangle.accs(FarmID.AIRDROP, A)).points.toString(), (i + 1).toString(), `airdrop points of A should be ${i}`)
    console.log('1x', tx.cumulativeGasUsed.toString())
}

// 10 person airdrop
let rs = []
for (let i = 0; i < 10; i++) rs.push(Wallet.createRandom().address)
let tx = await (await tangle.airdrop(rs, { gasPrice: 0, gasLimit: 2000000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), a_bal.sub(aa.mul(10 + 10)).toString(), `balanceOf A a_bal - ${10 + 10} * aa`)
assert.equal((await tangle.accs(FarmID.AIRDROP, A)).points.toString(), (10 + 10).toString(), `airdrop points of A should be ${10 + 10}`)
for (let i = 0; i < 10; i++) {
    assert.equal((await tangle.balanceOf(rs[i])).toString(), aa.toString(), `balanceOf r aa`)
}
console.log('10x', tx.cumulativeGasUsed.toString())

// 250 person airdrop
let count = 250
rs = []
for (let i = 0; i < count; i++) rs.push(Wallet.createRandom().address)
tx = await (await tangle.airdrop(rs, { gasPrice: 0, gasLimit: 8000000 })).wait()
assert.equal((await tangle.balanceOf(A)).toString(), a_bal.sub(aa.mul(count + 20)).toString(), `balanceOf A a_bal - ${1500 + 20} * aa`)
assert.equal((await tangle.accs(FarmID.AIRDROP, A)).points.toString(), (count + 20).toString(), `airdrop points of A should be ${count + 20}`)
for (let i = 0; i < 50; i++) {
    assert.equal((await tangle.balanceOf(rs[i])).toString(), aa.toString(), `balanceOf r aa`)
}
console.log(count, tx.cumulativeGasUsed.toString())

// // listen for Airdrop event
// tangle.once('Airdrop', (airdropper, recipients) => { console.log(airdropper, recipients) })


cluster.kill()