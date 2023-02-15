import { JsonRpcProvider } from "@ethersproject/providers"
import { BigNumber, Contract, Event, EventFilter } from "ethers5"
import { LevelChain } from "./LevelChain.mjs"
import tnglJson from '../json/tngl.json' assert { type: "json" }
import chains from '../json/chains.json' assert { type: "json" }
import { AbiCoder } from "@ethersproject/abi"
import { Synchronizer } from "./Synchronizer.mjs"
import { Level } from "level"

let tSubex = `tuple(uint input, uint chain, uint output)`
let tInput = `tuple(uint work, ${tSubex}[] subexs, address sender, uint value, uint gas, uint id)`

let coerceFunc = (type: string, value: any) => {
    if (value instanceof BigNumber) return BigInt(String(value))
    else if (type == 'tuple') {
        let filteredEntries = Object.entries(value).filter(entry => isNaN(Number(entry[0])))
        if (filteredEntries.length > 0) return Object.fromEntries(filteredEntries)
        else return value[0]
    }
    else return value
}
let abiCoder = new AbiCoder(coerceFunc)
let replacer = (_key: string, value: any) => typeof value == 'bigint' ? `0x${value.toString(16)}` : value

export class Watcher {

    provider: JsonRpcProvider
    tangle: Contract
    scanTo: number
    filter: EventFilter
    levelChain: LevelChain
    chain: { [key: string]: any }
    sync: Synchronizer
    conf: { [key: string]: any }
    handleOpenChange: (chain: string, open: string[]) => void
    
    constructor(
        level: Level, 
        chain: string, 
        conf: { [key: string]: any },
        handleOpenChange: (chain: string, open: string[]) => void
    ) {
        this.handleOpenChange = handleOpenChange
        this.levelChain = new LevelChain(level, chain)
        this.conf = conf
        this.chain = chains[chain]
        let url = this.chain.rpcUrls[0]
        this.provider = new JsonRpcProvider(url)
        let { address, abi } = tnglJson
        this.tangle = new Contract(address, abi, this.provider)
        this.filter = ['Execute', 'Exchange']
            .map(name => this.tangle.filters[name]())
            .map(filter => { return { address: filter.address, topics: [filter.topics.flat()] }})
            .reduce((p, c) => { return { address: c.address, topics: [[...p.topics[0], ...c.topics[0]]] }})
        this.sync = new Synchronizer({ [`${chain}.open`]: null })
        this.initialize()
    }

    async initialize() {
        let { provider, tangle, filter } = this
        tangle.on(filter, (event: Event) => this.handleEvent(event))
        this.scanTo = await provider.getBlockNumber()
        this.catchUp()
    }

    async catchUp() {
        let { conf } = this
        let { thunkDelay } = conf
        let thunk = await this.scanChunk()
        while (typeof thunk == 'function') {
            await new Promise(_ => setTimeout(_, thunkDelay))
            thunk = await thunk()
        }
        this.provider.on('block', block => this.handleBlock(block))
        console.log(`chain ${this.chain.id} caught up`)
    }

    async scanChunk() {
        let { levelChain, scanTo, filter, conf } = this
        let { batchSize } = conf
        let fromBlock = await levelChain.unknown
        let toBlock = Math.min(scanTo, fromBlock + batchSize)
        let result: Error | Event[] = await this.tangle.queryFilter(filter, fromBlock, toBlock)
            .catch((error: Error) => { return error })
        if (result instanceof Error) return this.handleScanChunkError(result) 
        else result.forEach(event => this.handleEvent(event))
        levelChain.unknown = toBlock + 1
        if (toBlock < scanTo) return () => this.scanChunk()
        else return null
    }

    handleScanChunkError(error: Error) {
        console.log(error)
        return () => this.scanChunk()
    }

    async handleEvent(event: Event) {
        let { tangle } = this
        if (event.topics[0] == tangle.filters['Execute']().topics[0]) this.handleExecute(event)
        if (event.topics[0] == tangle.filters['Exchange']().topics[0]) this.handleExchange(event)
    }

    async handleExchange(event: Event) {
        let { levelChain, chain, sync } = this
        let { open } = levelChain
        let { data } = event
        let input = abiCoder.decode([tInput], data)
        let inputJson = JSON.stringify(input, replacer)
        await sync.exec(open.push.bind(open), `${chain.id}.open`, inputJson)
        this.handleOpenChange(chain.id, await open.all())
    }

    async handleExecute(event: Event) {
        console.log('handling execute')
    }

    async handleBlock(block: number) {
        let { levelChain } = this
        levelChain.unknown = block + 1
    }

}