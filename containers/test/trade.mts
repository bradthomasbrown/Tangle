import { parseEther } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/keccak256'
import { defaultAbiCoder } from '@ethersproject/abi'
import { Cluster } from '../../classes/index.mjs'
import { drink } from '../../functions/drink.mjs'
import assert from 'node:assert/strict'
import { BigNumber } from 'ethers5'

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

let e = new Promise(resolve => tangle.on('NewRequest', request => resolve(request)))
await drink.bind(chain)(A, '12.8')

// zero-work exchange fails
assert.equal(await tangle.trade(100, '0', '2', parseEther('0.095'), { value: parseEther('0.1'), gasPrice: 0 }).catch((reason: any) => { return reason }) instanceof Error, true, 'zero work exchange fail')

// verify adisa entries and count, balance transfer and generator increase x16
for (let i = 0; i < 16; i++) {
    // console.log(i)
    let work = '100000'
    let sender = A
    let input = parseEther('0.1')
    let gas = '1000000000'
    let source = '8001'
    let dest =  '8002'
    let output = '12345'
    let id = i
    let roots = [...await tangle.ADISARoots()]
    // console.log(roots)
    let tx = await (await tangle.trade(gas, work, dest, output, { value: input, gasPrice: 0, gasLimit: 500000 })).wait()
    let request = { sender, gas, work, source, dest, input, output, id }
    let encoding = defaultAbiCoder.encode(['tuple(address sender, uint gas, uint work, uint source, uint dest, uint input, uint output, uint id) request'], [request])
    let r = parseInt(String(Math.log2(i ^ i + 1)))
    let hash = keccak256(encoding)
    for (let i = 0; i < r; i++) hash = keccak256(`${roots[i]}${hash.substring(2)}`)
    roots[r] = hash
    console.log(roots.map((h: string) => h.substring(2, 7)))
    assert.equal(BigNumber.from(i + 1).toString(), (await tangle.adisa()).toString(), 'adisa count')
    assert.equal((await tangle.ADISARoots())[r], roots[r], 'adisa roots')
    assert.equal((await tangle.balanceOf(A)).toString(), BigNumber.from('100000000000000000').sub((i + 1) * parseInt(gas)).toString(), 'A balance decrease')
    assert.equal((await tangle.balanceOf(tangle.address)).toString(), BigNumber.from('900000000000000000').add((i + 1) * parseInt(gas)).toString(), 'tangle balance increase')
    await (await tangle.payGens({ gasLimit: 500000, gasPrice: 0 })).wait()
    assert.equal((await tangle.farms(FarmID.MINE)).gen.maxValue.toString(), BigNumber.from('225000000000000000').add((i + 1) * parseInt(String(parseInt(gas) / 4))).toString(), 'generator M increase')
    console.log(tx.cumulativeGasUsed.toString())
}


await tangle.transfer(A, 0, { gasLimit: 500000, gasPrice: 0 })
// console.log(await e)
tangle.removeAllListeners()

cluster.kill()