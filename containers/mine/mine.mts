import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'
import { Wallet } from '@ethersproject/wallet'
import { Level } from 'level'
import { Watcher } from '../../classes/index.mjs'
import conf from './conf.json' assert { type: "json" }
import { Worker, isMainThread, parentPort } from 'worker_threads'
import { fileURLToPath } from 'url'

let t_Req = `tuple(address sender, uint gas, uint work, uint source, uint dest, uint input, uint output, uint id)`
let t_Proof = `tuple(bytes32[] hashes, uint index, uint subtree)`
let t_Input = `tuple(${t_Req} req, ${t_Proof} proof, uint subtrahend, uint newOutput)`
let t_Output = `tuple(address recipient, uint value)`
let t_Stream = `tuple(${t_Input}[] inputs, ${t_Output}[] outputs, uint chain)`
let t_Work = `tuple(bytes32 root, address worker, uint n)`

if (isMainThread) {

let desiredPopulation = 200
let loggingInterval = null
let cycleDelay = 0
let maxWorkAmount = 10000000n
let threads = 6

let start = Date.now() / 1000

let reviver = (key: any, value: any) => {
    switch (key) {
        case 'gas': case 'work': case 'input': case 'output': 
            return BigInt(value)
        default: return value
    }
}
let replacer = (_key: any, value: any) => {
    if (typeof value == 'bigint') return value.toString()
    else return value
}
let log2 = (bigint: bigint) => bigint.toString(2).length - 1
let randBitString = (length: number) => `0b${Array.from({ length }, 
    () => Math.random() > 0.5 ? '0': '1').join('')}`
let randBigInt = (limit: bigint) => {
    if (limit < 0n) return 0n
    let fn = () => BigInt(randBitString(log2(limit) + 1))
    let rand = fn()
    while (rand > limit) {
        rand = fn()
    }
    return rand
}
// source: https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/
let randomNormals = () => {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const R = Math.sqrt(-2.0 * Math.log(u1));
    const Θ = 2.0 * Math.PI * u2;
    return [R * Math.cos(Θ), R * Math.sin(Θ)];
};
// source: https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/
let randomSkewNormal = (ξ: number, ω: number, α = 0) => {
    const [u0, v] = randomNormals();
    if (α === 0) {
        return ξ + ω * u0;
    }
    const 𝛿 = α / Math.sqrt(1 + α * α);
    const u1 = 𝛿 * u0 + Math.sqrt(1 - 𝛿 * 𝛿) * v;
    const z = u0 >= 0 ? u1 : -u1;
    return ξ + ω * z;
};
let fertilityLookup = {}
let rsn = () => Math.floor(randomSkewNormal(0, 10, 4)) + 18
for (let i = 0; i < 1000000; i++) {
    let x = rsn()
    if (fertilityLookup[x] === undefined) fertilityLookup[x] = 0
    fertilityLookup[x]++
}
Object.keys(fertilityLookup).forEach(age => fertilityLookup[age] *= 0.0000015)
let mortalityLookup = { 
    male: Array.from({ length: 100 }, (_, i) => (i / 10) ** 3 / 970.299),
    female: Array.from({ length: 120 }, (_, i) => (i / 10) ** 3 / 1685.159)
}
let ψ = 1.0333
let mutateLookup = Array.from({ length: 256 }, (_, i) => ψ ** i)
let sum = mutateLookup.reduce((p, c) => p + c)
mutateLookup = mutateLookup.map(e => e / sum)

let db = new Level('db')
let reqStrs = []
let openLengthStr = await db.get('open.length')
    .catch((_reason: any) => { return undefined })
if (openLengthStr) {
    let length = parseInt(openLengthStr)
    let range = Array.from({ length }, (_, i) => `open[${i}]`)
    let values = await db.getMany(range)
    reqStrs.push(...values)
}

let iteration = 0
function updateReqs(_reqStrs: any) {
    reqStrs = _reqStrs;
    iteration = 0
}
new Watcher({ db, conf, updateReqs })

let ruler = (x: number) => parseInt(String(Math.log2(x ^ x + 1)))
let nextAdd = (x: number) => x + 2 ** ruler(x)
let nextDel = (x: number) => x + 2 ** (ruler(x) + 1)
let getSubtrees = (ids: number[], count: number) => {
    let na = nextAdd(ids[ids.length - 1])
    let nd = nextDel(ids[0])
    if (na >= count && nd >= count) return ids.map(id => ruler(id))
    if (na <= nd) ids.push(na)
    else ids.shift()
    return () => getSubtrees(ids, count)
}
let getTree = async (id: number, subtree: number, chain: string) => {
    let tree = []
    let index = id % 2 ** subtree
    tree.push((await db.getMany(Array(2 ** subtree).fill(0).map((_e, i) => 
        `${chain}[0x${(id - index + i).toString(16)}]`)))
        .map(reqStr => JSON.parse(reqStr))
        .map(req => defaultAbiCoder.encode([t_Req], [req]))
        .map(encoding => keccak256(encoding)))
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
let getProof = async (chain: string, idStr: string) => {
    let countStr = await db.get(`${chain}.length`)
    let count = parseInt(countStr)
    let id = parseInt(idStr)
    let thunk = getSubtrees([id], count)
    while (typeof thunk == 'function') thunk = thunk()
    let subtrees = thunk
    let subtree = subtrees[0]
    if (subtree == 0) return { hashes: [], index: 0, subtree: 0 }
    let index = id % 2 ** subtree
    let tree = await getTree(id, subtree, chain)
    let proof = buildProof(index, tree)
    return { hashes: proof, index: id % 2 ** subtree, subtree: subtree }
}
let getStreams = async (trade: any) => {
    let streams = []
    let genes = Object.entries(trade.genes)
    let outputsObj = {}
    for (let i = 0; i < genes.length; i++) {
        let gene = genes[i]
        let chain = gene[0]
        let inputs = []
        let data = Object.entries(gene[1])
        for (let j = 0; j < data.length; j++) {
            let datum = data[j]
            if (!datum[0].match('0x')) continue
            let id = datum[0]
            let req = JSON.parse(await db.get(`${chain}[${id}]`), reviver)
            let { output, dest, sender } = req
            let proof = await getProof(chain, id)
            let subtrahend = BigInt(datum[1])
            let newOutput = output * (req.input - subtrahend) / req.input
            let input = { req, proof, subtrahend, newOutput }
            inputs.push(input)
            if (!outputsObj[`${dest}:${sender}`]) 
                outputsObj[`${dest}:${sender}`] = 0n
            outputsObj[`${dest}:${sender}`] += 
                output * (req.input - subtrahend) / req.input
        }
        let outputs = []
        let stream = { inputs, outputs, chain }
        streams.push(stream)
    }
    Object.entries(outputsObj).forEach(entry => {
        let [dest, recipient] = entry[0].split(':')
        let value = entry[1]
        if (value == 0n) return
        let destStreams = streams.filter(stream => stream.chain == dest)
        if (destStreams.length == 0) return
        let stream = destStreams[0]
        stream.outputs.push({ recipient, value })
    })
    return streams
}

let bestTrade = undefined
let miningJob = { 
    completionRate: 0,
    streams: undefined,
    works: [],
    remainingWork: undefined
}
let updateBestTrade = async (individual: any) => {
    console.log(`[${Date.now() / 1000 - start}]\tnew best fitness ${individual.fitness}`)
    let { completionRate } = miningJob
    if (bestTrade === undefined 
    || individual.fitness > bestTrade.fitness * (1 - completionRate)) {
        bestTrade = individual
        let completionRate = 0
        let works = []
        let streams = await getStreams(bestTrade)
        let remainingWork = streams.map(stream => 
            stream.inputs.map((input: any) => input.req.work)
            .reduce((p: any, c: any) => c > p ? c : p, 0n))
            .reduce((p: any, c: any) => c > p ? c : p, 0n)
        miningJob = { completionRate, streams, works, remainingWork }
    }
}
let tsolv = async (W: { root: string, worker: string }, work: bigint) => {
    W['n'] = 0n
    let threadWorkers = []
    W = await new Promise(_ => {
        for (let i = 0; i < threads; i++) {
            let threadNum = i
            let threadWorker = new Worker(fileURLToPath(import.meta.url))
            threadWorker.postMessage({ W, work, threadNum, threads })
            threadWorker.on('message', (m: any) => _(m))
            threadWorkers.push(threadWorker)
        }
    })
    await Promise.all(threadWorkers.map(threadWorker =>
            threadWorker.terminate()))
    return W
}
let wallet = Wallet.createRandom()
let worker = wallet.address
let score = (hash: string) => 1n << BigInt(BigInt(hash).toString(2).padStart(256, '0').indexOf('1'))
let mine = async () => {
    let { streams, works, remainingWork } = miningJob
    if (streams !== undefined) {
        let streamsEncoding = defaultAbiCoder.encode([`${t_Stream}[]`], [streams])
        let streamsHash = keccak256(streamsEncoding)
        let root = works.length == 0 ? streamsHash : keccak256(defaultAbiCoder.encode([t_Work], [works[works.length - 1]]))
        let workAmount = remainingWork > maxWorkAmount 
            ? maxWorkAmount : remainingWork
        let work = await tsolv({ root, worker: worker }, workAmount)
        let workHash = keccak256(defaultAbiCoder.encode([t_Work], [work]))
        let workScore = score(workHash)
        miningJob.remainingWork -= workScore
        miningJob.works.push(work)
        console.dir(miningJob, { depth: Infinity })
    }
    if (miningJob.remainingWork <= 0n) {
        console.log('mining complete!')
    }
    setImmediate(() => mine())
}
mine()

let spawn = (args: any) => {
    let { father, mother } = args
    let chains = {}
    let mutate = false
    let mutationRate = 0.1 / Math.log(iteration)
    if (Math.random() < mutationRate) mutate = true
    reqStrs.map(reqStr => {
        let req = JSON.parse(reqStr, reviver)
        let { gas, input, source, dest, output, id } = req
        let S = chains[source]
        let D = chains[dest]
        let subtrahend: bigint
        if (father && mother && father.genes && mother.genes 
        && father.genes[source] && mother.genes[source]
        && father.genes[source][id] && mother.genes[source][id]) {
            let fSub = father.genes[source][id]
            let mSub = mother.genes[source][id]
            let α: bigint
            let β: bigint
            let x: any
            let y: any
            if (fSub > mSub) { y = father; x = mother }
            else { y = mother; x = father; }
            if (x.penalty > y.penalty) { α = 2n; β = 4n }
            else if (y.penalty > x.penalty) { α = 4n; β = 2n }
            else { α = 2n; β = 2n }
            let xSub: bigint = x.genes[source][id]
            let ySub: bigint = y.genes[source][id]
            let lower: bigint = xSub - (ySub - xSub) / α
            let upper: bigint = ySub + (ySub - xSub) / β
            let range: bigint = upper - lower
            subtrahend = randBigInt(range) + lower
        } else subtrahend = randBigInt(input)
        if (mutate) {
            let upper = subtrahend + subtrahend / 2n
            let lower = subtrahend - subtrahend / 2n
            let range = upper - lower
            subtrahend = randBigInt(range) + lower
        }
        if (subtrahend < 0n) subtrahend = 0n
        if (subtrahend > input) subtrahend = input
        let effInput = input - subtrahend
        let effOutput = output * effInput / input
        let effGas = parseFloat(`${gas}`) 
            * parseFloat(`${effInput}`) / parseFloat(`${input}`)
        if (!S) S = chains[source] = {}
        if (!S['effGas']) S['effGas'] = 0
        if (!S['input']) S['input'] = 0
        S[id] = subtrahend
        S['input'] += parseFloat(`${effInput}`)
        S['effGas'] += effGas
        if (!D) D = chains[dest] = {}
        if (!D['output']) D['output'] = 0
        D['output'] += parseFloat(`${effOutput}`)
    })
    let penalty = Object.values(chains)
        .map((chain: any) => {
            let input = chain.input
            let output = chain.output
            if (output === undefined || output === 0) return 1
            let deficit = output - input
            if (deficit < 0) return 1
            return 1 - deficit / output
        })
        .reduce((p, c) => p * c)
    let fitness = Object.values(chains)
        .filter(chain => chain['effGas'])
        .map(chain => chain['effGas'])
        .reduce((p, c) => p + c, 0) * penalty
    let age = 0
    let gender = Math.random() < 0.5 ? 'male' : 'female'
    if (args.gender) gender = args.gender
    let obj = { penalty, fitness, genes: chains, age, gender }
    if (penalty == 1 && 
    (bestTrade === undefined || fitness > bestTrade.fitness))
        updateBestTrade(obj)
    return obj
}


let population = []
let reproduce = (individual: any, newPop: any[]) => {
    let p = 1 - 1000 / (iteration + 1000)
    let suitors = population
        .filter(individual => individual.gender == 'male')
        .sort((a, b) => {
            return parseInt(`${b.fitness - a.fitness}`)
        })
    if (suitors.length == 0) return
    let suitor = undefined
    while (!suitor) {
        for (let i = 0; i < suitors.length; i++)
            if (Math.random() < p * (1 - p) ** i) {
                suitor = suitors[i]
                break
            }
    }
    newPop.push(spawn({ father: suitor, mother: individual }))
}

if (loggingInterval != null)
    setInterval(() => {
        let best = population.sort((a, b) => b.fitness - a.fitness)[0]
        let { fitness, penalty } = best || {}
        // let clearCommand = '\u001b[2J\u001b[0;0H'
        let clearCommand = ''
        let bestStr = `${JSON.stringify(best, replacer, 4)}\n`
        // let bestStr = ''
        let mutationRate = 0.1 / Math.log2(iteration)
        let selectionStrength = 1 - 1000 / (iteration + 1000)
        process.stdout.write(`${clearCommand}fitness\t${fitness}\npenalty\t${penalty}\npop.len\t${population.length}\niter\t${iteration}\nmutate\t${mutationRate}\nselect\t${selectionStrength}\n${bestStr}`)
    }, loggingInterval);

let fn = async () => {
    let newPop = []
    population.forEach((individual: any, j, pop) => {
        let { gender, age } = individual
        if (gender == 'female') {
            let fertility = fertilityLookup[age]
            if (fertility === undefined) fertility = 0
            if (population.length < desiredPopulation) fertility = 1
            if (Math.random() < fertility) reproduce(individual, newPop)
        }
        let mortality = mortalityLookup[gender][age]
        if (mortality === undefined) mortality = 1
        if (Math.random() < mortality
        && population.length >= desiredPopulation)
            pop.splice(j, 1)
        individual.age++
    })
    population = [...population, ...newPop]
    if (reqStrs.length !== 0) {
        if (population.filter(i => i.gender == 'male').length == 0)
            population.push(spawn({ gender: 'male' }))
        if (population.filter(i => i.gender == 'female').length == 0)
            population.push(spawn({ gender: 'female' }))
    }
    iteration++
    if (cycleDelay !== 0) await new Promise(_ => setTimeout(_, cycleDelay))
    setImmediate(() => fn())
}
// console.log(population)
fn()

} else {

    parentPort.once('message', async m => {
        let { W, work, threadNum, threads } = m

        let cycle = 0
        W['n'] += BigInt(threadNum)
        let BI_threads = BigInt(threads);
        
        (async () => {
            await new Promise(_ => setTimeout(_, 10000 / threads * threadNum))
            setInterval(() => {
                console.log(`thread ${threadNum} cycles ${cycle}`)
            }, 10000)
        })()

        let score = (hash: string) => 1n << BigInt(BigInt(hash).toString(2).padStart(256, '0').indexOf('1'))
        let solve = () => {
            cycle++
            let hash = keccak256(defaultAbiCoder.encode([t_Work], [W]))
            if (score(hash) >= work) return W
            else { W['n'] += BI_threads; return () => solve() }
        }
        let thunk = solve()
        await new Promise(_ => {
            let fn = () => {
                if (typeof thunk != 'function') { _(null); return }
                thunk = thunk()
                setImmediate(fn)
            }
            fn()
        })
        console.log(`thread ${threadNum} finished`)
        parentPort.postMessage(W)
    })

}