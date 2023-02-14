import { parseEther } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/keccak256'
import { defaultAbiCoder } from '@ethersproject/abi'
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { Cluster } from '../../classes/index.mjs'
import { drink } from '../../functions/drink.mjs'
import assert from 'node:assert/strict'
import { BigNumber, Wallet } from 'ethers5'
import { Level } from 'level'

let cluster = new Cluster(0)
await cluster.deployed
for (let c = 0; c < 10; c++) {
    let chain = cluster.createChain()
    await chain.deployed
    // let { provider } = chain
    let provider = new WebSocketProvider(`http://chain${chain.chainid}:8546`)
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

    let db = new Level(`db${c}`)
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
        return () => getSubtrees(ids, count)
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
        let thunk = getSubtrees([id], exchangeCount)
        while (typeof thunk == 'function') thunk = thunk()
        let subtrees = thunk
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
        console.log(`creating exchange ${i} on chain ${c}`)
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
        // exchange
        await (await tangle.exchange(work, [{ chain: 2, value: parseEther(requestValue) }], gas, { value: parseEther(value), gasPrice: 0, gasLimit: 250000 })).wait()
    }
    // switch context to executor
    tangle = tangle.connect(executor)

    // console.log(`waiting for all inputs on chain ${c} to process`)
    // wait for all inputs to process
    await p

    // console.log(await Promise.all(Array(parseInt(String(Math.log2(exchangeCount))) + 1).fill(0).map((_e, i) => tangle.root(i))))

    // build inputs
    // console.log(`building inputs on chain ${c}`)
    let inputs = [0, 5, 6, 7].map(i => allInputs[i])
    // add a duplicate input on chain 2
    if (c == 1) {
        console.log(`adding duplicate input to inputs on chain ${c}`)
        inputs.push(allInputs[5])
    }
    if (c == 3) {
        console.log(`incrementing value of input 0 by 1 on chain ${c}`)
        let input = { ...inputs[0] }
        input.value = input.value.add(1)
        input.requests = inputs[0].requests
        inputs[0] = input
    }
    // console.log(inputs)
    // console.log(inputs.map(input => keccak256(defaultAbiCoder.encode([t_input], [input]))))

    // build inputProofs
    // console.log(`building input proofs on chain ${c}`)
    let proofs = await Promise.all(inputs.map(async input => proof(parseInt(String(input.id)))))
    if (c == 2) {
        console.log(`incrementing proof 0 hash 0 by 1 on chain ${c}`)
        proofs[0].hashes[0] = `0x${(BigInt(proofs[0].hashes[0]) + 1n).toString(16).padStart(64, '0')}`
    }
    // console.log(proofs)

    // build outputs
    // console.log(`building outputs on chain ${c}`)
    let inputsValue = inputs.map(input => input.value).reduce((p, c) => p.add(c))
    let recipient0 = Wallet.createRandom().address
    let recipient1 = Wallet.createRandom().address
    let outputs = [
        { recipient: recipient0, value: inputsValue.mul(2).div(3) },
        { recipient: recipient1, value: inputsValue.sub(inputsValue.mul(2).div(3)).sub(inputs[1].value.sub(parseEther('0.5'))) }
    ]
    if (c == 6) {
        console.log(`incrementing output 0 value by 1 on chain ${c}`)
        outputs[0].value = outputs[0].value.add(1)
    }
    if (c == 7) {
        console.log(`decrementing output 0 value by 1 on chain ${c}`)
        outputs[0].value = outputs[0].value.sub(1)
    }
    // console.log(outputs)

    // build rollovers
    // console.log(`building rollovers on chain ${c}`)
    let inMod = { index: 1, subtrahend: parseEther('0.5') }
    let reqMods = [{ index: 0, subtrahend: parseEther('0.495') }]
    let rollovers = [{ inMod, reqMods }]
    if (c == 8) {
        console.log(`incrementing rollover 0 inMod subtrahend by 1 on chain ${c}`)
        rollovers[0].inMod.subtrahend = rollovers[0].inMod.subtrahend.add(1)
    }
    if (c == 9) {
        console.log(`decrementing rollover 0 inMod subtrahend by 1 on chain ${c}`)
        rollovers[0].inMod.subtrahend = rollovers[0].inMod.subtrahend.sub(1)
    }
    // let rollovers = []

    // build streams
    // console.log(`building streams on chain ${c}`)
    let streams = [{ inputs, proofs, outputs, rollovers, chain: 1 }]

    // build works
    // console.log(`building works on chain ${c}`)
    let streamsHash = keccak256(defaultAbiCoder.encode([`${t_stream}[]`], [streams]))
    // console.log('STREAMSHASH')
    // console.log(streamsHash)
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
    // let work = inputs.map(input => input.work).reduce((p, c) => c.gt(p) ? c : p)
    let works = []
    let workers = Array(4).fill(0).map(e => Wallet.createRandom())
    for (let i = 0; i < 4; i++) {
        console.log(`solving work ${i} on chain ${c}`)
        let worker = workers[i]
        let root = i == 0 ? streamsHash : keccak256(defaultAbiCoder.encode([t_work], [works[works.length - 1]]))
        if (i == 0) root = keccak256(defaultAbiCoder.encode(['bytes32', 'bytes32'], [root, '0x0000000000000000000000000000000000000000000000000000000000000001']))
        if (i == 1) {
            root = keccak256(defaultAbiCoder.encode(['bytes32', 'bytes32'], [root, '0x0000000000000000000000000000000000000000000000000000000000000002']))
            root = keccak256(defaultAbiCoder.encode(['bytes32', 'bytes32'], ['0x0000000000000000000000000000000000000000000000000000000000000003', root]))
        }
        if (i == 2) root = keccak256(defaultAbiCoder.encode(['bytes32', 'bytes32'], ['0x0000000000000000000000000000000000000000000000000000000000000004', root]))
        let work: BigNumber
        if (i == 0) work = BigNumber.from(4096)
        if (i == 1) work = BigNumber.from(2048)
        if (i == 2) {
            if (c == 5) {
                console.log('setting work target of worker 2 to 128 instead of 16384')
                work = BigNumber.from(128)
            } else work = BigNumber.from(16384)
        }
        if (i == 3) work = BigNumber.from(1024)
        works.push(tsolv({ root, worker: worker.address }, work, 'eq'))
        // console.log(`work ${i} solved on chain ${c}`)
    }

    // console.log('WORKS')
    // console.log(works)
    // console.log('WORK HASHES')
    // console.log(works.map(work => keccak256(defaultAbiCoder.encode([t_work], [work]))))

    // build workProofs
    // console.log(`building work proofs on chain ${c}`)
    let workProofs = [
        { hashes: ['0x0000000000000000000000000000000000000000000000000000000000000001'], index: 0, subtree: 0},
        { hashes: ['0x0000000000000000000000000000000000000000000000000000000000000002', '0x0000000000000000000000000000000000000000000000000000000000000003'], index: 2, subtree: 0},
        { hashes: ['0x0000000000000000000000000000000000000000000000000000000000000004'], index: 1, subtree: 0},
        { hashes: [], index: 0, subtree: 0}
    ]
    if (c == 4) {
        console.log(`incrementing work proof 0 hash 0 by 1 on chain ${c}`)
        workProofs[0].hashes[0] = `0x${(BigInt(workProofs[0].hashes[0]) + 1n).toString(16).padStart(64, '0')}`
    }
    // console.log('WORKPROOFS')
    // console.log(workProofs)



    // submit execution
    // console.log(`submitting execution on chain ${c}`)
    let args = [streams, works, workProofs]

    // chain 1 execute logic
    if (c == 0) {
        console.log(`submitting execution on chain ${c}`)
        await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait()

        // verify that resubmitting throws error
        console.log(`verifying execute resubmit fails on chain ${c}`)
        assert.equal(await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait().catch((e: any) => { return e}) instanceof Error, true, 'resubmit fail')

        // VERIFICATION
        console.log(`verifying invariants on chain ${c}`)
        // 225 in binary is 11100001, indicating that inputs 0, 5, 6, 7 were all set
        assert.equal((await tangle.chunks(0)).toString(), '225', 'chunks set correctly')
        let recipient0Payment = outputs[0].value.mul(19).div(20)
        let recipient1Payment = outputs[1].value.mul(19).div(20)
        assert.equal((await provider.getBalance(recipient0)).toString(), recipient0Payment.toString(), 'recipient0 balance')
        assert.equal((await provider.getBalance(recipient1)).toString(), recipient1Payment.toString(), 'recipient1 balance')
        let sum_outputs = outputs.map(output => output.value).reduce((p, c) => p.add(c))
        let executorPayment = sum_outputs.mul(3).div(20).div(4)
        let worker0Payment = sum_outputs.mul(4096).div(22528).div(20).div(4)
        let worker1Payment = sum_outputs.mul(2048).div(22528).div(20).div(4)
        let worker2Payment = sum_outputs.mul(16384).div(22528).div(20).div(4).add(executorPayment)
        assert.equal(worker0Payment.toString(), (await provider.getBalance(workers[0].address)).toString(), 'worker 0 payment')
        assert.equal(worker1Payment.toString(), (await provider.getBalance(workers[1].address)).toString(), 'worker 1 payment')
        assert.equal(worker2Payment.toString(), (await provider.getBalance(workers[2].address)).toString(), 'worker 2 payment')
        let allInputsValue = allInputs.slice(0, 8).map(input => input.value).reduce((c, p) => p.add(c))
        let tangleBalance = allInputsValue.sub(worker0Payment).sub(worker1Payment).sub(worker2Payment).sub(recipient0Payment).sub(recipient1Payment)
        assert.equal((await provider.getBalance(tangle.address)).toString(), tangleBalance.toString(), 'tangle balance')
        let totalGas = inputs.map(input => input.gas).reduce((p, c) => p.add(c))
        let totalWork = inputs.map(input => input.work).reduce((p, c) => p.add(c))
        let executorPoints = BigNumber.from(22528).mul(3).mul(totalGas).div(totalWork)
        let worker0Points = BigNumber.from(4096).mul(totalGas).div(totalWork)
        let worker1Points = BigNumber.from(2048).mul(totalGas).div(totalWork)
        let worker2Points = BigNumber.from(16384).mul(totalGas).div(totalWork).add(executorPoints)
        assert.equal((await tangle.accounts('GentleMidnight', workers[0].address)).P.toString(), worker0Points.toString(), 'worker 0 points')
        assert.equal((await tangle.accounts('GentleMidnight', workers[1].address)).P.toString(), worker1Points.toString(), 'worker 1 points')
        assert.equal((await tangle.accounts('GentleMidnight', workers[2].address)).P.toString(), worker2Points.toString(), 'worker 2 points')
        await new Promise(_ => setTimeout(_, 1000))
        // console.log(allInputs)
        assert.equal(allInputs[allInputs.length - 1].value.toString(), inputs[1].value.sub(parseEther('0.5')).toString(), 'rollover value')
    } else {
        // other chains logic
        console.log(`verifying execute failure on chain ${c}`)
        assert.equal(await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait().catch((e: any) => { return e }) instanceof Error, true, `exec should have failed on chain ${c}`)
    }
}

cluster.kill()
process.exit()