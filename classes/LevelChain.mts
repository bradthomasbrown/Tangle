import { Level } from "level"
import { LevelArray } from "./LevelArray.mjs"
import chains from '../json/chains.json' assert { type: "json" }

export class LevelChain {

    level: Level
    id: string
    initialized: Promise<void>
    open: LevelArray

    constructor(level: Level, id: string) {
        this.level = level
        this.id = id
        this.open = new LevelArray(level, `${id}.open`)
        this.initialized = this.initialize()
    }

    async initialize() {
        let { level, id } = this
        let unknownStr = await level.get(`${id}.unknown`)
            .catch((reason: any) => { return undefined })
        if (!unknownStr) {
            let { deployBlock } = chains[id]
            await level.put(`${id}.unknown`, String(deployBlock))
        }
    }

    get unknown() { return this.getUnknown() }
    set unknown(value: number | Promise<number>) { this.setUnknown(value) }

    async getUnknown() {
        let { level, initialized, id } = this
        await initialized
        let unknownStr = await level.get(`${id}.unknown`)
        return parseInt(unknownStr)
    }

    async setUnknown(value: number | Promise<number>) {
        let { level, initialized, id } = this
        await initialized
        await level.put(`${id}.unknown`, String(value))
    }

}