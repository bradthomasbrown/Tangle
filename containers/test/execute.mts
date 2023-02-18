import { formatEther, parseEther, parseUnits } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/keccak256'
import { defaultAbiCoder } from '@ethersproject/abi'
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { Cluster } from '../../classes/index.mjs'
import { drink } from '../../functions/drink.mjs'
import assert from 'node:assert/strict'
import { BigNumber, Wallet } from 'ethers5'
import { Level } from 'level'

enum FarmID {
    HOLD,
    AIRDROP,
    STAKE,
    MINE,
    ROLL
}

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
    let t_req = `tuple(address sender, uint gas, uint work, uint source, uint dest, uint input, uint output, uint id)`
    let t_proof = `tuple(bytes32[] hashes, uint index, uint subtree)`
    let t_input = `tuple(${t_req} req, ${t_proof} proof, uint subtrahend, uint newOutput)`
    let t_output = `tuple(address recipient, uint value)`
    let t_stream = `tuple(${t_input}[] inputs, ${t_output}[] outputs, uint chain)`
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
        console.log(`id ${id} subtrees ${subtrees}`)
        let subtree = subtrees[0]
        if (subtree == 0) return { hashes: [], index: 0, subtree: 0 }
        let index = id % 2 ** subtree
        let tree = await getTree(id, subtree)
        let proof = buildProof(index, tree)
        return { hashes: proof, index: id % 2 ** subtree, subtree: subtree }
    }
    let allRequests = []
    let handleExchange = async (input: any) => { 
        await db.put(input.id.toString(), keccak256(defaultAbiCoder.encode([t_req], [input])))
        if (allRequests.push(input) == exchangeCount) finish()
    }
    tangle.on('NewReq', handleExchange)

    // create request with exchangeCount subreqs
    let subreqs = []
    let inputSum = undefined
    let gasSum = undefined
    for (let i = 0; i < exchangeCount; i++) {
        console.log(`creating request ${i} on chain ${c}`)
        // randomize exchange parameters
        let work = parseInt(String(Math.random() * (10000 + 1) + 10000))
        let output = parseEther(`${String((Math.random() * 2 - 1) * 0.01 + 0.95).substring(0,11)}${String(Math.random()).substring(2,11)}`)
        let gas = parseInt(String(Math.random() * (100000 - 100 + 1) + 100))
        let input = parseEther(`${String((Math.random() * 2 - 1) * 0.01 + 1).substring(0,11)}${String(Math.random()).substring(2,11)}`)
        gasSum = gasSum ? gasSum + gas : gas
        inputSum = inputSum ? inputSum.add(input) : input
        let dest = '8002'
        subreqs.push({ gas, work, dest, input, output })
    }
    // create random wallet
    let wallet = Wallet.createRandom().connect(provider)
    // switch context to owner
    tangle = tangle.connect(owner)
    // send TNGL gas money to random wallet
    console.log(`transferring ${gasSum + 1} tangle to wallet ${wallet.address}`)
    await (await tangle.transfer(wallet.address, gasSum + 1, { gasPrice: 0, gasLimit: 250000 })).wait()
    // switch context to random wallet
    tangle = tangle.connect(wallet)
    // send spending ETH to random wallet
    console.log(`obtaining ${formatEther(String(inputSum))} ether from faucet`)
    await drink.bind(chain)(wallet.address, formatEther(String(inputSum)))
    // exchange
    console.log(`submitting trade with msgValue of ${inputSum}`)
    await (await tangle.trade(subreqs, { value: inputSum, gasPrice: 0, gasLimit: 250000 })).wait()

    // switch context to executor
    tangle = tangle.connect(executor)

    // console.log(`waiting for all inputs on chain ${c} to process`)
    // wait for all inputs to process
    await p

    // console.log(await Promise.all(Array(parseInt(String(Math.log2(exchangeCount))) + 1).fill(0).map((_e, i) => tangle.root(i))))

    // build inputs
    // console.log(`building inputs on chain ${c}`)
    let requests = [0, 5, 6, 7].map(i => allRequests[i])
    // add a duplicate input on chain 2
    if (c == 1) {
        console.log(`adding duplicate input to inputs on chain ${c}`)
        requests.push(allRequests[5])
    }
    if (c == 3) {
        console.log(`incrementing value of input 0 by 1 on chain ${c}`)
        let request = { ...requests[0] }
        request.input = request.input.add(1)
        requests[0] = request
    }
    let inputs = requests.map(request => {
        return {
            req: request,
            proof: undefined,
            subtrahend: BigNumber.from(0),
            newOutput: '0'
        }
    })
    inputs[3].subtrahend = parseEther('0.7')
    inputs[3].newOutput = '12345'
    // console.log(inputs)
    // console.log(inputs.map(input => keccak256(defaultAbiCoder.encode([t_input], [input]))))

    // build inputProofs
    console.log(`building input proofs on chain ${c}`)
    let proofs = await Promise.all(requests.map(async request => proof(parseInt(String(request.id)))))
    for (let i = 0; i < inputs.length; i++) inputs[i].proof = proofs[i]
    if (c == 2) {
        console.log(`incrementing proof 0 hash 0 by 1 on chain ${c}`)
        proofs[0].hashes[0] = `0x${(BigInt(proofs[0].hashes[0]) + 1n).toString(16).padStart(64, '0')}`
    }
    // console.log(proofs)

    // build outputs
    // console.log(`building outputs on chain ${c}`)
    let requestInputs = requests.map(request => request.input).reduce((p, c) => p.add(c)).sub(parseEther('0.7'))
    let recipient0 = Wallet.createRandom().address
    let recipient1 = Wallet.createRandom().address
    let outputs = [
        { recipient: recipient0, value: requestInputs.mul(2).div(3) },
        { recipient: recipient1, value: requestInputs.sub(requestInputs.mul(2).div(3)) }
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

    // build streams
    // console.log(`building streams on chain ${c}`)
    // if no chains in streams equal execute()'s chain id, it will use the first available chain
    // so we can set it to 0 here event if the chain we're submitting to isn't chain.id = 0
    let streams = [{ inputs, outputs, chain: 0 }]

    // build works
    // console.log(`building works on chain ${c}`)
    console.log('encoding and hashing streams')
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
        let tx = await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait()
        console.log(`${tx.cumulativeGasUsed}`)

        // verify that resubmitting throws error
        console.log(`verifying execute resubmit fails on chain ${c}`)
        assert.equal(await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait().catch((e: any) => { return e}) instanceof Error, true, 'resubmit fail')

        // VERIFICATION
        console.log(`verifying invariants on chain ${c}`)
        // 225 in binary is 11100001, indicating that inputs 0, 5, 6, 7 were all set
        assert.equal((await tangle.chunks(0)).toString(), '225', 'chunks set correctly')
        let recipient0Payment = outputs[0].value
        let recipient1Payment = outputs[1].value
        assert.equal((await provider.getBalance(recipient0)).toString(), recipient0Payment.toString(), 'recipient0 balance')
        assert.equal((await provider.getBalance(recipient1)).toString(), recipient1Payment.toString(), 'recipient1 balance')
        let allRequestsValue = allRequests.slice(0, 8).map(request => request.input).reduce((c, p) => p.add(c))
        let tangleBalance = allRequestsValue.sub(recipient0Payment).sub(recipient1Payment)
        assert.equal((await provider.getBalance(tangle.address)).toString(), tangleBalance.toString(), 'tangle balance')
        let reqGas = inputs.map(input => input.req.gas).reduce((p, c) => p.add(c))
        let totalGas = inputs.reduce((p, input) => {
            let { req } = input
            return p.add(req.gas.mul(req.input.sub(input.subtrahend)).div(req.input))
        }, BigNumber.from(0))
        let totalRollGas = inputs.reduce((p, input) => {
            let { req } = input
            return p.add(req.gas.sub(req.gas.mul(req.input.sub(input.subtrahend)).div(req.input)))
        }, BigNumber.from(0))
        let totalWork = BigNumber.from(4096).add(2048).add(16384).add(1024)
        let maxInputWork = requests.map(request => request.work).reduce((p, c) => c.gt(p) ? c : p)
        console.log(`reqGas ${reqGas}`)
        console.log(`totalGas ${totalGas}`)
        console.log(`totalRollGas ${totalRollGas}`)
        console.log(`totalWork ${totalWork}`)
        console.log(`maxInputWork ${maxInputWork}`)
        let worker0Points = BigNumber.from(4096).mul(totalGas).div(totalWork)
        let worker1Points = BigNumber.from(2048).mul(totalGas).div(totalWork)
        let worker2Points = BigNumber.from(16384).mul(totalGas).div(totalWork)
        let worker3Points = BigNumber.from(1024).mul(totalGas).div(totalWork)
        console.log(`worker0Points ${worker0Points}`)
        console.log(`worker1Points ${worker1Points}`)
        console.log(`worker2Points ${worker2Points}`)
        console.log(`worker3Points ${worker3Points}`)
        assert.equal((await tangle.farms(FarmID.MINE)).points.toString(), worker0Points.add(worker1Points).add(worker2Points).add(worker3Points).toString(), 'farm mine points')
        assert.equal((await tangle.accs(FarmID.MINE, workers[0].address)).points.toString(), worker0Points.toString(), 'worker 0 points')
        assert.equal((await tangle.accs(FarmID.MINE, workers[1].address)).points.toString(), worker1Points.toString(), 'worker 1 points')
        assert.equal((await tangle.accs(FarmID.MINE, workers[2].address)).points.toString(), worker2Points.toString(), 'worker 2 points')
        assert.equal((await tangle.accs(FarmID.MINE, workers[3].address)).points.toString(), worker3Points.toString(), 'worker 3 points')
        let worker0RollPoints = BigNumber.from(4096).mul(totalRollGas).div(totalWork)
        let worker1RollPoints = BigNumber.from(2048).mul(totalRollGas).div(totalWork)
        let worker2RollPoints = BigNumber.from(16384).mul(totalRollGas).div(totalWork)
        let worker3RollPoints = BigNumber.from(1024).mul(totalRollGas).div(totalWork)
        assert.equal((await tangle.farms(FarmID.ROLL)).points.toString(), worker0RollPoints.add(worker1RollPoints).add(worker2RollPoints).add(worker3RollPoints).toString(), 'farm Roll points')
        assert.equal((await tangle.accs(FarmID.ROLL, workers[0].address)).points.toString(), worker0RollPoints.toString(), 'worker 0 Roll points')
        assert.equal((await tangle.accs(FarmID.ROLL, workers[1].address)).points.toString(), worker1RollPoints.toString(), 'worker 1 Roll points')
        assert.equal((await tangle.accs(FarmID.ROLL, workers[2].address)).points.toString(), worker2RollPoints.toString(), 'worker 2 Roll points')
        assert.equal((await tangle.accs(FarmID.ROLL, workers[3].address)).points.toString(), worker3RollPoints.toString(), 'worker 3 Roll points')
    } else {
        // other chains logic
        console.log(`verifying execute failure on chain ${c}`)
        assert.equal(await (await tangle.execute(...args, { gasPrice: 0, gasLimit: 1000000 })).wait().catch((e: any) => { return e }) instanceof Error, true, `exec should have failed on chain ${c}`)
    }
}

cluster.kill()
process.exit()