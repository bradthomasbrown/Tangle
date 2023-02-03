type LFN = () => Promise<LFN | any> 
export class Synchronizer
{

    locks: { [key: string]: Promise<void> | null }
    
    constructor(locks?: { [key: string]: Promise<void> | null }) {
        if (locks) this.locks = locks
    }

    async exec(fn: (...args: any) => Promise<any>, key: string, ...args: any) {
        let locks = this.locks
        let lfn: LFN = async () => {
            if (key && locks[key] === undefined) throw new Error(`unknown lock key ${key}`)
            if (key && locks[key]) { await locks[key]; return () => lfn() }
            let resolve = () => {}
            if (key) { locks[key] = new Promise(_ => resolve = _) }
            let result = await fn(...args)
            if (key) { locks[key] = null; resolve() }
            return result
        }
        let thunk = await lfn()
        while (typeof thunk == 'function') thunk = await thunk()
        return thunk
    }
    
}