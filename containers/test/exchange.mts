import { parseEther } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/keccak256'
import { defaultAbiCoder } from '@ethersproject/abi'
import { Cluster } from '../../classes/index.mjs'
import { drink } from '../../functions/drink.mjs'
import assert from 'node:assert/strict'
import { BigNumber } from 'ethers5'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle } = chain.contracts
let A_wallet = chain.wallet
let A = A_wallet.address

let e = new Promise(resolve => tangle.on('Exchange', input => resolve(input)))
await drink.bind(chain)('1.6')

// zero-work exchange fails
assert.equal(await tangle.exchange('0', [{ chain: 2, value: parseEther('0.095') }], 100, { value: parseEther('0.1'), gasPrice: 0 }).catch((reason: any) => { return reason }) instanceof Error, true, 'zero work exchange fail')

let roots = []
// verify adisa entries and count, balance transfer and generator increase x16
for (let i = 0; i < 16; i++) {
    let work = '100000'
    let requests = [{ chain: 2, value: parseEther('0.095') }]
    let sender = A
    let value = parseEther('0.1')
    let gas = 100
    let id = i
    let tx = await (await tangle.exchange(work, requests, gas, { value: value, gasPrice: 0, gasLimit: 250000 })).wait()
    let input = { work, requests, sender, value, gas, id }
    let encoding = defaultAbiCoder.encode(['tuple(uint work, tuple(uint chain,uint value)[] requests, address sender, uint value, uint gas, uint id)'], [input])
    let r = parseInt(String(Math.log2(i ^ i + 1)))
    let hash = keccak256(encoding)
    for (let i = 0; i < r; i++) hash = keccak256(`${await tangle.root(i)}${hash.substring(2)}`)
    roots[r] = hash
    console.log(roots.map((h: string) => h.substring(2, 7)))
    assert.equal(BigNumber.from(i + 1).toString(), (await tangle.adisa()).toString(), 'adisa count')
    assert.equal(await tangle.root(r), roots[r], 'adisa roots')
    assert.equal((await tangle.balanceOf(A)).toString(), BigNumber.from('100000000000000000').sub((i + 1) * gas).toString(), 'A balance decrease')
    assert.equal((await tangle.balanceOf(tangle.address)).toString(), BigNumber.from('900000000000000000').add((i + 1) * gas).toString(), 'tangle balance increase')
    assert.equal((await tangle.generator()).M.toString(), BigNumber.from('900000000000000000').add((i + 1) * gas).toString(), 'generator M increase')
    console.log(tx.cumulativeGasUsed.toString())
}


await tangle.update({ gasPrice: 0 })
console.log(await e)
tangle.removeAllListeners()

cluster.kill()