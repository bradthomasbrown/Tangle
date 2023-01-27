import { writeFile } from 'fs/promises'
import { constants, open, openSync, readFileSync } from 'fs'
import { Contract, ContractFactory, Wallet } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { deployPipeline, handleCatch } from '../functions/index.mjs'
import { Socket } from 'net'

export class Chain {

    provider: JsonRpcProvider
    wallet: Wallet
    contracts: Contract[]
    
    constructor(chainid: number) {
        let name = `chain${chainid}`
        writeFile('host', `containers/chain/run ${name} ${chainid} & `)
        this.provider = new JsonRpcProvider(`http://${name}:8545`)
        this.wallet = Wallet.createRandom().connect(this.provider)
        this.contracts = []
    }

    async deploy(name?: string, ...args: any[]): Promise<void> {
        if (!name) return deployPipeline.bind(this)()
        console.log(`requesting compiler for ${name} data`)
        console.log(`deploying ${name} with args ${JSON.stringify(args)}`)
        writeFile('compiler', `${name}`)
        readFileSync('pipe', { encoding: 'utf8' })
        // let { abi, object } = JSON.parse(readFileSync('pipe', { encoding: 'utf8' }))
        // let factory = new ContractFactory(abi, object, this.wallet)
        // this.contracts[name] = await factory.deploy(...args).catch(handleCatch)
    }

}