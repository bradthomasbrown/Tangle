import { randomBytes } from 'crypto'
import { Level } from 'level'
import { Watcher } from '../../classes/index.mjs'
import conf from './conf.json' assert { type: "json" }

let selectionStrength = 0.9
let mutationRate = 0.0025
let desiredPopulation = 100
let loggingInterval = 250
let cycleDelay = 0

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
    // let bar = 0
    while (rand > limit) {
        rand = fn()
        // if (bar > 0 && bar % 10000 == 0) {
        //     console.log('bar', limit)
        // }
        // bar++
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
// console.log('building fertilityLookup')
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
// console.log('building mutateLookup')
let ψ = 1.0333
let mutateLookup = Array.from({ length: 256 }, (_, i) => ψ ** i)
let sum = mutateLookup.reduce((p, c) => p + c)
mutateLookup = mutateLookup.map(e => e / sum)

// console.log('opening db')
let db = new Level('db')
let reqStrs = []
// console.log('getting existing open trades')
let openLengthStr = await db.get('open.length')
    .catch((_reason: any) => { return undefined })
if (openLengthStr) {
    let length = parseInt(openLengthStr)
    let range = Array.from({ length }, (_, i) => `open[${i}]`)
    let values = await db.getMany(range)
    reqStrs.push(...values)
}
function updateReqs(_reqStrs: any) { reqStrs = _reqStrs; }
// console.log('starting watcher')
new Watcher({ db, conf, updateReqs })
// console.log(reqStrs)

let spawn = (args: any) => {
    // console.log('begin')
    let { father, mother } = args
    let chains = {}
    let mutate = false
    if (Math.random() < mutationRate) mutate = true
    reqStrs.map(reqStr => {
        let req = JSON.parse(reqStr, reviver)
        let { gas, input, source, dest, output, id } = req
        let S = chains[source]
        let D = chains[dest]
        let subtrahend: bigint
        if (father && mother) {
            let fSub: bigint = father.genes[source][id]
            let mSub: bigint = mother.genes[source][id]
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
            // console.log(`FSUB`, fSub)
            // console.log(`MSUB`, mSub)
            // console.log(`x.penalty`, x.penalty)
            // console.log(`y.penalty`, y.penalty)
            // console.log(`xSub`, xSub)
            // console.log(`ySub`, ySub)
            // console.log(`α`, α)
            // console.log(`β`, β)
            // console.log(`UPPER`, upper)
            // console.log(`LOWER`, lower)
            // console.log(`RANGE`, range)
            // console.log(`SUBTRAHEND`, subtrahend)
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
    // console.log('')
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
    // Object.values(chains).forEach(chain => {
    //     delete chain['effGas']
    //     delete chain['output']
    //     delete chain['input']
    // }) 
    let age = 0
    let gender = Math.random() < 0.5 ? 'male' : 'female'
    if (args.gender) gender = args.gender
    let obj = { penalty, fitness, genes: chains, age, gender }
    // if (adam) obj['immortal'] = true
    // if (father && mother) {
    //     console.log('father')
    //     console.log(father)
    //     console.log('mother')
    //     console.log(mother)
    //     console.log('child')
    //     console.log(obj)
    // }
    // console.log('end')
    return obj
}

// console.log('initializing population')
let population = []
// population.push(spawn({ gender: 'male', adam: true }))
population.push(spawn({ gender: 'male' }))
population.push(spawn({ gender: 'female' }))

let reproduce = (individual: any, newPop: any[]) => {
    // console.log('reproduce')
    let p = selectionStrength
    // console.log('getSuitors')
    let suitors = population
        .filter(individual => individual.gender == 'male')
        .sort((a, b) => {
            return parseInt(`${b.fitness - a.fitness}`)
        })
    if (suitors.length == 0) {
        return
    }
    let suitor = undefined
    // let foo = 0
    // console.log('pickSuitor')
    // console.log(suitors.length)
    while (!suitor) {
        // console.log(`foo ${foo}`)
        for (let i = 0; i < suitors.length; i++)
            if (Math.random() < p * (1 - p) ** i) {
                suitor = suitors[i]
                break
            }
        // console.log(`boo ${foo}`)
        // if (foo % 100000 == 0 && foo > 0) {
        //     console.log(suitors)
        //     console.log(population)
        // }
        // foo++
    }
    // console.log(`spawn`)
    let child = spawn({ father: suitor, mother: individual })
    // console.log(`fawn`)
    newPop.push(child)
}

// console.log('beginning logging cycle')
let iteration = 0
setInterval(() => {
    let best = population.sort((a, b) => b.fitness - a.fitness)[0]
    let { fitness, penalty } = best
    let clearCommand = '\u001b[2J\u001b[0;0H'
    process.stdout.write(`${clearCommand}fitness\t${fitness}\npenalty\t${penalty}\npop.len\t${population.length}\niter\t${iteration}\n${JSON.stringify(best, replacer, 4)}\n`)
    // for (let j = 0; j < population.length; j++) {
    //     let individual = population[j]
    //     let { age, gender, fitness, invalid } = individual
    //     let colorcode = gender == 'female' ? 95 : 96
    //     let delimeter = j == population.length - 1 ? ']\n' : ','
    //     let info = `\x1b[${colorcode}m${age}-${fitness}\x1b[0m${delimeter}`
    //     process.stdout.write(`${info}`)
    // }
}, loggingInterval);

let fn = async () => {
    // console.log('fn')
    let newPop = []
    // console.log('popLoop')
    population.forEach((individual: any, j, pop) => {
        let { gender, age, immortal } = individual
        // console.log('reproduceCheck')
        if (gender == 'female') {
            let fertility = fertilityLookup[age]
            if (fertility === undefined) fertility = 0
            if (population.length < desiredPopulation) fertility = 1
            // console.log(`fertility ${fertility}`)
            if (Math.random() < fertility) reproduce(individual, newPop)
            // console.log('baz')
        }
        // console.log('mortalityCheck')
        let mortality = mortalityLookup[gender][age]
        if (mortality === undefined) mortality = 1
        if (Math.random() < mortality
        && population.length >= desiredPopulation)
            pop.splice(j, 1)
        individual.age++
    })
    // console.log('popAdd')
    population = [...population, ...newPop]
    // console.log('popEnforceMinSize')
    if (population.filter(i => i.gender == 'male').length == 0)
        population.push(spawn({ gender: 'male' }))
    if (population.filter(i => i.gender == 'female').length == 0)
        population.push(spawn({ gender: 'female' }))
    iteration++
    // console.log('nextFn')
    if (cycleDelay !== 0) await new Promise(_ => setTimeout(_, cycleDelay))
    setImmediate(() => fn())
}
// console.log('starting genetic algorithm')
fn()