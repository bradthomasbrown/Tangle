import { writeFile } from 'fs/promises'
import { Chain } from './Chain.mjs'
import { compile } from '../functions/compile.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'
import { writeFileSync } from 'fs'

export class Cluster {

    compiled: Promise<Compiled>
    chains: Chain[]
    deployed: Promise<void>
    
    constructor(n: number) {
        this.compiled = compile()
        this.chains = [...Array(n).keys()].map(n => new Chain(n + 1, this.compiled))
        this.deployed = Promise.all(this.chains.map(chain => chain.deployed)).then()
    }

    createChain() {
        this.chains.push(new Chain(this.chains.length + 1, this.compiled))
        return this.chains[this.chains.length - 1]
    }

    kill(): void {
        writeFileSync('host', 'docker kill $(docker ps -q --filter ancestor="chain"); rm containers/chain/pipes/*;')
    }

}