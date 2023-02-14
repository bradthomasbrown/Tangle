import { Level } from 'level'

export class LevelArray {

    level: Level
    name: string
    initialized: Promise<void>

    constructor(level: Level, name: string) {
        this.level = level
        this.name = name
        this.initialized = this.initialize()
    }

     async initialize() {
        let { level, name } = this
        let length = await level.get(`${name}.length`)
            .catch((_reason: any) => { return undefined })
        if (!length) await level.put(`${name}.length`, '0')
    }

    async push(value: string) {
        let { level, name, initialized } = this
        await initialized
        let lengthStr = await level.get(`${name}.length`)
        let key = `${name}[${lengthStr}]`
        await level.put(key, value)
        lengthStr = String(parseInt(lengthStr) + 1)
        await level.put(`${name}.length`, lengthStr)
    }

    async all() {
        let { level, name, initialized } = this
        await initialized
        let lengthStr = await level.get(`${name}.length`)
        let length = parseInt(lengthStr)
        let range = Array.from({ length }, (_, i) => `${name}[${i}]`)
        return level.getMany(range)
    }

}