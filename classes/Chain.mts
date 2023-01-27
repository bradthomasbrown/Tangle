import { writeFile } from 'fs/promises'
import { Contract, ContractFactory, Wallet } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { deployPipeline, handleCatch } from '../functions/index.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'

export class Chain {

    contracts: { [key: string]: Contract }
    compiled: Promise<Compiled>
    provider: JsonRpcProvider
    wallet: Wallet
    
    constructor(chainid: number, compiled: Promise<Compiled>) {
        this.compiled = compiled
        let name = `chain${chainid}`
        writeFile('host', `(cd containers/chain; mkfifo pipes/${name}; ./run ${name} ${chainid} &);`)
        this.provider = new JsonRpcProvider(`http://${name}:8545`)
        this.wallet = Wallet.createRandom().connect(this.provider)
        this.contracts = {}
    }

    async deploy(name?: string, ...args: any[]): Promise<void> {
        // if (!name) return deployPipeline.bind(this)()
        // await this.provider.ready
        // let compiled = await this.compiled.catch(handleCatch)
        // let { abi, bytecode } = compiled[name]
        // let factory = new ContractFactory(abi, bytecode, this.wallet)
        // this.contracts[name] = await factory.deploy(...args, { gasPrice: 0 }).catch(handleCatch)
    }

}