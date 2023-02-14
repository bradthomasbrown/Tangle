import { writeFile } from 'fs/promises'
import { Contract, Wallet } from 'ethers5'
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { deployPipeline } from '../functions/index.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'
import { Network } from '@ethersproject/networks'

export class Chain {

    chainid: number
    compiled: Promise<Compiled>
    provider: JsonRpcProvider
    wallet: Wallet
    ready: Promise<Network>
    contracts: { [key: string]: Contract }
    deployed: Promise<void>
    
    constructor(chainid: number, compiled: Promise<Compiled>) {
        Object.assign(this, { chainid, compiled })
        let name = `chain${chainid}`
        writeFile('host', `(cd containers/chain; mkfifo pipes/${name}; ./run ${name} 800${chainid} &);`)
        this.provider = new JsonRpcProvider(`http://${name}:8545`)
        this.provider.pollingInterval = 1000
        this.wallet = Wallet.createRandom().connect(this.provider)
        this.ready = this.provider.ready
        this.contracts = {}
        this.deployed = deployPipeline.bind(this)()
    }

}