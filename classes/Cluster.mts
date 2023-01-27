import { writeFile } from 'fs/promises'
import { Chain } from './Chain.mjs'
import { compile } from '../functions/compile.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'

export class Cluster {
    chains: Chain[]
    compiled: Promise<Compiled>
    
    constructor(n: number) {
        this.chains = []
        // for (let i = 0; i < n; i++) this.chains.push(new Chain(i))
        this.compiled = compile()
    }

    async ready() {
        return Promise.all(this.chains.map(chain => chain.provider.ready))
    }

    async kill(): Promise<void> {
        writeFile('host', 'docker kill $(docker ps -q --filter ancestor="chain");')
    }

    async deploy() {
        return Promise.all(this.chains.map(chain => chain.deploy()))
    }

}