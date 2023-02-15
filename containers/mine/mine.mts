import { Level } from 'level'
import { Watcher } from '../../classes/index.mjs'
import conf from './conf.json' assert { type: "json" }

let db = new Level('db')
let open = {}

function handleOpenChange(chain: string, _open: string[]) {
    open[chain] = _open
    console.log(open)
}

await Promise.all(conf.watchChains.map(async chain => {
    let watcher = new Watcher(db, chain, conf, handleOpenChange)
    open[chain] = (await watcher.levelChain.open.all())
        .map(_ => JSON.parse(_))
}))

// console.log(open)

// function createIndividual() {
//     let openCopy = JSON.parse(JSON.stringify(open))
//     let streams = Object.fromEntries(
//         Object.entries(openCopy)
//         .map(entry => [entry[0], {
//             inputs: openCopy[entry[0]],
//             outputs: undefined
//         }])
//     )
//     Object.keys(openCopy).forEach(chain => {
//         let { [chain]: _, ...foreignOpenByChain } = openCopy
//         let foreignOpen = Object.values(foreignOpenByChain).flat()
//         let relevantForeignOpen = foreignOpen.filter((open: any) => {
//             let { requests } = open
//             let requestChains = requests.map((request: any) => request.chain).flat()
//             return requestChains.includes(chain)
//         })
//         let htof = (hex: string) => parseFloat(String(BigInt(hex)))
//         let requestedByAddress = relevantForeignOpen.reduce((prev, open: any) => {
//             let { requests, sender } = open
//             let relevantRequest = requests.filter((request: any) => request.chain == chain)[0]
//             if (!prev[sender]) prev[sender] = relevantRequest.value
//             else prev[sender] = `0x${(htof(prev[sender]) + htof(relevantRequest.value)).toString(16)}`
//             return prev
//         }, {})
//         let recipientRandom = Object.entries(requestedByAddress).map((_: any) => {
//             return {
//                 recipient: _[0],
//                 value: `0x${Math.floor(Math.random() * (htof(_[1]) + 1)).toString(16)}`
//             }
//         })
//         streams[chain].outputs = recipientRandom
//         streams[chain].inputs.forEach((input: any) => {
            
//         })
//     })
//     return streams
// }

// function streamFitness(stream: any) {
//     let { inputs, outputs } = stream
//     let gas: bigint = inputs.reduce((p: any, c: any) => p + BigInt(c.gas), 0n)
//     let outVal: bigint = outputs.reduce((p: any, c: any) => p + BigInt(c.value), 0n)
//     let inVal: bigint = inputs.reduce((p: any, c: any) => p + BigInt(c.value), 0n)
//     if (!inVal) return 0
//     console.log(`gas ${gas}`)
//     console.log(`outVal ${outVal}`)
//     console.log(`inVal ${inVal}`)
//     let score = gas * outVal / inVal
//     console.log(`score ${score}`)
//     return parseFloat(String(score)) / parseFloat(String(gas))
// }

// console.log(JSON.stringify(open))
// let individual = createIndividual()
// console.log(JSON.stringify(individual))
// Object.entries(individual).forEach(e => {
//     console.log(`${e[0]} ${streamFitness(e[1])}`)
// })

// let popCount = 100
// let population = Array.from({ length: popCount }, createIndividual)

// console.log(population)