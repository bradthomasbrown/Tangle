import { JsonRpcProvider } from "@ethersproject/providers"
import { BigNumber, Contract, Event, EventFilter } from "ethers5"
import { LevelChain } from "./LevelChain.mjs"
import tnglJson from '../json/tngl.json' assert { type: "json" }
import chains from '../json/chains.json' assert { type: "json" }
import { AbiCoder } from "@ethersproject/abi"
import { Synchronizer } from "./Synchronizer.mjs"
import { Level } from "level"
import { LevelArray } from "./index.mjs"

let t_Req = `tuple(address sender, uint gas, uint work, uint source, uint dest, uint input, uint output, uint id)`

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

    sync: Synchronizer
    initialized: Promise<void>
    open: LevelArray
    args: { [key: string]: any }
    
    constructor(args: { [key: string]: any }) {
        this.args = args
        let { watchList } = args.conf
        this.sync = new Synchronizer({ open: null })
        watchList.forEach((chainid: string) => {
            this.initialize(chainid)
        })
    }

    async initialize(chainid: string) {
        let { db } = this.args
        let chain = chains[chainid]
        let { rpcUrls, deployBlock } = chain
        let rpcUrl = rpcUrls[0]
        let provider = new JsonRpcProvider(rpcUrl)
        let { address, abi } = tnglJson
        let tangle = new Contract(address, abi, provider)
        let scanTo = await provider.getBlockNumber()
        let unknownStr = await db.get(`${chainid}.unknown`)
            .catch((_reason: any) => { return undefined })
        if (!unknownStr) {
            await db.put(`${chainid}.unknown`, `${deployBlock}`)
            unknownStr = `${deployBlock}`
        }
        let unknown = parseInt(unknownStr)
        if (unknown < scanTo) this.catchUp(chainid, tangle, unknown, scanTo)
        else {
            console.log(`chain ${chainid} caught up`)
            provider.on('block', (block: any) => 
                this.handleBlock(chainid, block))
        }
    }

    async catchUp(chainid: string, tangle: Contract, unknown: number, 
    scanTo: number) {
        let { thunkDelay } = this.args.conf
        let { provider } = tangle
        let thunk = await this.scanChunk(tangle, unknown, scanTo)
        while (typeof thunk == 'function') {
            await new Promise(_ => setTimeout(_, thunkDelay))
            thunk = await thunk()
        }
        provider.on('block', (block: any) => this.handleBlock(chainid, block))
        console.log(`chain ${chainid} caught up`)
    }

    async scanChunk(tangle: Contract, unknown: number, scanTo: number) {
        let { conf, db } = this.args
        let { batchSize } = conf
        let toBlock = Math.min(scanTo, unknown + batchSize)
        let network = await tangle.provider.getNetwork()
        let chainidInt = network.chainId
        let chainid = `0x${chainidInt.toString(16)}`
        let filter = ['Execute', 'NewReq']
            .map(name => tangle.filters[name]())
            .map(filter => { return { address: filter.address, topics: [filter.topics.flat()] }})
            .reduce((p, c) => { return { address: c.address, topics: [[...p.topics[0], ...c.topics[0]]] }})
        let result: Error | Event[] = await tangle
            .queryFilter(filter, unknown, toBlock)
            .catch((error: Error) => { return error })
        if (result instanceof Error)
            return () => this.scanChunk(tangle, unknown, scanTo)
        else result.forEach(event => this.handleEvent(tangle, event))
        unknown = toBlock + 1
        await db.put(`${chainid}.unknown`, `${toBlock + 1}`)
        if (toBlock < scanTo) 
            return () => this.scanChunk(tangle, unknown, scanTo)
        else return null
    }

    async handleEvent(tangle: Contract, event: Event) {
        let { sync } = this
        if (event.topics[0] == tangle.filters['Execute']().topics[0]) this.handleExecute(event)
        if (event.topics[0] == tangle.filters['NewReq']().topics[0]) {
            let fn = async () => this.handleExchange(event);
            await sync.exec(fn, 'open')
        }
    }

    async handleExchange(event: Event) {
        let { db, updateReqs } = this.args
        let { data } = event
        let input = abiCoder.decode([t_Req], data)
        let inputJson = JSON.stringify(input, replacer)
        let source = `0x${input.source.toString(16)}`
        let id = `0x${input.id.toString(16)}`

        let sourceLenStr = await db.get(`${source}.length`)
            .catch((_reason: any) => { return undefined })
        if (!sourceLenStr) {
            await db.put(`${source}.length`, '0')
            sourceLenStr = '0'
        }
        await db.put(`${source}[${id}]`, inputJson)
        sourceLenStr = String(parseInt(sourceLenStr) + 1)
        await db.put(`${source}.length`, sourceLenStr)

        let openLenStr = await db.get('open.length')
            .catch((_reason: any) => { return undefined })
        if (!openLenStr) {
            await db.put('open.length', '0')
            openLenStr = '0'
        }
        let key = `open[${openLenStr}]`
        await db.put(key, inputJson)
        openLenStr = String(parseInt(openLenStr) + 1)
        await db.put('open.length', openLenStr)

        let openLen = parseInt(openLenStr)
        let range = Array.from({ length: openLen }, (_, i) => `open[${i}]`)
        updateReqs(await db.getMany(range))
    }

    async handleExecute(_event: Event) {
        console.log('handling execute')
    }

    async handleBlock(chainid: string, block: number) {
        let { db } = this.args
        await db.put(`${chainid}.unknown`, `${block + 1}`)
    }

}