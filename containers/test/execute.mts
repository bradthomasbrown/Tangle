import { defaultAbiCoder, keccak256, parseEther } from 'ethers/lib/utils.js'
import { Cluster, Synchronizer } from '../../classes/index.mjs'
import { drink } from '../../functions/drink.mjs'
import assert from 'node:assert/strict'
import { BigNumber, Wallet } from 'ethers'
import { Level } from 'level'
import { resolve } from 'node:path'

let cluster = new Cluster(1)
await cluster.deployed
let chain = cluster.chains[0]
let { provider } = chain
let { tangle } = chain.contracts
let owner = chain.wallet
let executor = Wallet.createRandom().connect(provider)
let t_request = `tuple(uint chain, uint value)`
let t_input = `tuple(uint work, ${t_request}[] requests, address sender, uint value, uint gas, uint id)`
let t_proof = `tuple(bytes32[] hashes, uint index, uint subtree)`
let t_output = `tuple(address recipient, uint value)`
let t_modifier = `tuple(uint index, uint subtrahend)`
let t_rollover = `tuple(${t_modifier} inMod, ${t_modifier}[] reqMods)`
let t_stream = `tuple(${t_input}[] inputs, ${t_proof}[] proofs, ${t_output}[] outputs, ${t_rollover}[] rollovers, uint chain)`
let t_work = `tuple(bytes32 root, address worker, uint n)`

let db = new Level('db')
let finish: () => void
let p = new Promise(_ => finish = () => _(null))
let exchangeCount = 8

let nextAdd = (x: number) => x + 2 ** ruler(x)
let nextDel = (x: number) => x + 2 ** (ruler(x) + 1)
let ruler = (x: number) => parseInt(String(Math.log2(x ^ x + 1)))
let getSubtrees = (ids: number[], count: number) => {
    let na = nextAdd(ids[ids.length - 1])
    let nd = nextDel(ids[0])
    if (na >= count && nd >= count) return ids.map(id => ruler(id))
    if (na <= nd) ids.push(na)
    else ids.shift()
    return getSubtrees(ids, count)
}
let getTree = async (id: number, subtree: number) => {
    let tree = []
    let index = id % 2 ** subtree
    tree.push(await db.getMany(Array(2 ** subtree).fill(0).map((_e, i) => (id - index + i).toString())))
    while (tree[tree.length - 1].length > 2) {
        let tmp = [...tree[tree.length - 1]]
        tree.push([])
        while (tmp.length > 0) {
            let foo = tmp.splice(0, 2)
            tree[tree.length - 1].push(keccak256(`${foo[0]}${foo[1].substring(2)}`))
        }
    }
    return tree
}
let buildProof = (index: number, tree: any[]) => {
    let proof = []
    for (let branch = 0; branch < tree.length; index = parseInt(String(index / 2)), branch++) {
        let nodes = tree[branch]
        proof.push(nodes[index + index % 2 * -2 + 1])
    }
    return proof
}
let proof = async (id: number) => {
    let subtrees = getSubtrees([id], exchangeCount)
    let subtree = subtrees[0]
    if (subtree == 0) return { hashes: [], index: 0, subtree: 0 }
    let index = id % 2 ** subtree
    let tree = await getTree(id, subtree)
    let proof = buildProof(index, tree)
    return { hashes: proof, index: id % 2 ** subtree, subtree: subtree }
}
let allInputs = []
let handleExchange = async (input: any) => { 
    await db.put(input.id.toString(), keccak256(defaultAbiCoder.encode([t_input], [input])))
    if (allInputs.push(input) == exchangeCount) finish()
}
tangle.on('Exchange', handleExchange)

// create exchanges
for (let i = 0; i < exchangeCount; i++) {
    // randomize exchange parameters
    let work = parseInt(String(Math.random() * (10000 + 1) + 10000))
    let requestValue = `${String((Math.random() * 2 - 1) * 0.01 + 0.95).substring(0,11)}${String(Math.random()).substring(2,11)}`
    let gas = parseInt(String(Math.random() * (100000 - 100 + 1) + 100))
    let value = `${String((Math.random() * 2 - 1) * 0.01 + 1).substring(0,11)}${String(Math.random()).substring(2,11)}`
    // create random wallet
    let wallet = Wallet.createRandom().connect(provider)
    // switch context to owner
    tangle = tangle.connect(owner)
    // send TNGL gas money to random wallet
    await (await tangle.transfer(wallet.address, gas, { gasPrice: 0, gasLimit: 250000 })).wait()
    // switch context to random wallet
    tangle = tangle.connect(wallet)
    // send spending ETH to random wallet
    await drink.bind(chain)(wallet.address, value)
    // wait to allow jsonProvider poll time to catch exchange event
    await new Promise(_ => setTimeout(_, 125))
    // exchange
    await (await tangle.exchange(work, [{ chain: 2, value: parseEther(requestValue) }], gas, { value: parseEther(value), gasPrice: 0, gasLimit: 250000 })).wait()
}
// switch context to executor
tangle = tangle.connect(executor)

// wait for all inputs to process
await p

console.log(await Promise.all(Array(parseInt(String(Math.log2(exchangeCount))) + 1).fill(0).map((_e, i) => tangle.root(i))))

// build inputs
let inputs = [0, 5, 6, 7].map(i => allInputs[i])
console.log(inputs)
console.log(inputs.map(input => keccak256(defaultAbiCoder.encode([t_input], [input]))))

// build inputProofs
let proofs = await Promise.all(inputs.map(async input => proof(parseInt(String(input.id)))))
console.log(proofs)

// build outputs
let inputsValue = inputs.map(input => input.value).reduce((p, c) => p.add(c))
let recipient0 = Wallet.createRandom().address
let recipient1 = Wallet.createRandom().address
let outputs = [
    { recipient: recipient0, value: inputsValue.mul(2).div(3) },
    { recipient: recipient1, value: inputsValue.sub(inputsValue.mul(2).div(3)) }
]
console.log(outputs)

// build rollovers
let rollovers = []

// build streams
let streams = [{ inputs, proofs, outputs, rollovers, chain: 1 }]

// build works
let streamsHash = keccak256(defaultAbiCoder.encode([`${t_stream}[]`], [streams]))
let score = (hash: string) => 1n << BigInt(BigInt(hash).toString(2).padStart(256, '0').indexOf('1'))
let tsolv = (W: { root: string, worker: string }, work: BigNumber, mode: string) => {
    W['n'] = 0n
    let solve = () => {
        let hash = keccak256(defaultAbiCoder.encode([t_work], [W]))
        if (BigNumber.from(score(hash))[mode](work)) return W
        else { W['n']++; return () => solve() }
    }
    let thunk = solve()
    while (typeof thunk == 'function') thunk = thunk()
    W['n'] = W['n'].toString()
    return thunk
}
let work = inputs.map(input => input.work).reduce((p, c) => c.gt(p) ? c : p)
let W = tsolv({ root: streamsHash, worker: executor.address }, work, 'gte')
let works = [W]

// build workProofs
let hashes = []
let index = 0
let workProofs = [{ hashes, index, subtree: 0 }]

let args = [streams, works, workProofs]
console.log(await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait())

cluster.kill()
process.exit()