import { writeFile } from 'fs/promises'
import { Chain } from './Chain.mjs'
import { compile } from '../functions/compile.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'

export class Cluster {

    compiled: Promise<Compiled>
    chains: Chain[]
    ready: Promise<void>
    deployed: Promise<void>
    
    constructor(n: number) {
        this.compiled = compile()
        this.chains = [...Array(n).keys()].map(n => new Chain(n + 1, this.compiled))
        this.ready = Promise.all(this.chains.map(chain => chain.ready)).then()
        this.deployed = Promise.all(this.chains.map(chain => chain.deployed)).then()
    }

    async kill(): Promise<void> {
        writeFile('host', 'docker kill $(docker ps -q --filter ancestor="chain"); rm containers/chain/pipes/*;')
    }

}