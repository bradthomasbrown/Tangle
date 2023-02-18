import { parseEther } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/keccak256'
import { defaultAbiCoder } from '@ethersproject/abi'
import { Cluster } from '../../classes/index.mjs'
import { drink } from '../../functions/drink.mjs'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle } = chain.contracts
let A_wallet = chain.wallet
let A = A_wallet.address

// let e = new Promise(resolve => tangle.on('NewReq', request => resolve(request)))
let y = 4
let x = 4
await drink.bind(chain)(A, String(x * y))

// zero-work exchange fails
assert.equal(await tangle.trade(100, '0', '2', parseEther('0.095'), { value: parseEther('0.1'), gasPrice: 0 }).catch((reason: any) => { return reason }) instanceof Error, true, 'zero work exchange fail')

// set up listener
let reqObj = {}
let i = 0
let allEventsReceived = new Promise(_ => {
    tangle.on('NewReq', req => {
        reqObj[String(req.id)] = req
        if (++i == x * y) _(null)
    })
})

// submit X subreqs Y times
let avgGasCost = undefined
for (let i = 0; i < y; i++) {
    let subreqs = []
    for (let j = 0; j < x; j++) {
        let work = parseInt(String(Math.random() * (10000 + 1) + 10000))
        let output = parseEther(`${String((Math.random() * 2 - 1) * 0.01 + 0.51).substring(0,11)}${String(Math.random()).substring(2,11)}`)
        let gas = parseInt(String(Math.random() * (100000 - 100 + 1) + 100))
        let input = parseEther(`${String((Math.random() * 2 - 1) * 0.01 + 0.99).substring(0,11)}${String(Math.random()).substring(2,11)}`)
        let dest = '8002'
        subreqs.push({ gas, work, dest, input, output })
    }
    let inputSum = subreqs.map(subreq => subreq.input).reduce((p, c) => p.add(c))
    let tx = await (await tangle.trade(subreqs, { value: inputSum, gasLimit: 4000000, gasPrice: 0 })).wait()
    if (!avgGasCost) avgGasCost = tx.cumulativeGasUsed
    else avgGasCost = avgGasCost.mul(i + 1).add(tx.cumulativeGasUsed).div(i + 2)
}
// log average gas cost per trade, adisa.count and adisa.roots
console.log(`avgGasCost per trade ${avgGasCost.div(x)}`)
console.log(`adisa.count ${await tangle.adisa()}`)
let adisaRoots = JSON.stringify((await tangle.ADISARoots()).map((h: string) => h.substring(2, 7)))
console.log(`adisa roots ${adisaRoots}`)

// wait for all events to be received, then put them in order as reqs
await allEventsReceived
let reqs = Array.from({ ...reqObj, length: x * y })

// calculate what ADISA roots should be from our reqs
let roots = []
for (let i = 0; i < reqs.length; i++) {
    let encoding = defaultAbiCoder.encode(['tuple(address sender, uint gas, uint work, uint source, uint dest, uint input, uint output, uint id) req'], [reqs[i]])
    let hash = keccak256(encoding)
    let r = parseInt(String(Math.log2(i ^ i + 1)))
    for (let i = 0; i < r; i++) hash = keccak256(`${roots[i]}${hash.substring(2)}`)
    roots[r] = hash
    console.log(roots.map((h: string) => h.substring(2, 7)))
}
let rootsStr = JSON.stringify(roots.map((h: string) => h.substring(2, 7)))
assert.equal(adisaRoots, rootsStr, 'roots predicted')

// payGens, predict what gen maxValues are
let gasSum = reqs.map((req: any) => req.gas).reduce((p, c) => p.add(c))
enum FarmID { HOLD, AIRDROP, STAKE, MINE, ROLL }
let pMaxValue = (await tangle.farms(FarmID.HOLD)).gen.maxValue
await (await tangle.payGens({ gasPrice: 0, gasLimit: 1000000 })).wait()
let cMaxValue = (await tangle.farms(FarmID.HOLD)).gen.maxValue
assert.equal(String(cMaxValue), String(pMaxValue.add(gasSum.div(5))), 'payGens gas added value')

// exit
tangle.removeAllListeners()
cluster.kill()
process.exit()