import { writeFile } from 'fs/promises'
import { Chain } from './Chain.mjs'
import { compile } from '../functions/compile.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'

export class Cluster {

    chains: Chain[]
    compiled: Promise<Compiled>
    deployed: Promise<void>
    ready: Promise<void>
    
    constructor(n: number) {
        this.chains = []
        this.compiled = compile()
        for (let i = 0; i < n; i++) this.chains.push(new Chain(i + 1, this.compiled))
        this.deployed = Promise.all(this.chains.map(chain => chain.deploy())).then()
        this.ready = Promise.all(this.chains.map(chain => chain.provider.ready)).then()
    }

    async kill(): Promise<void> {
        writeFile('host', 'docker kill $(docker ps -q --filter ancestor="chain"); rm containers/chain/pipes/*;')
    }

}