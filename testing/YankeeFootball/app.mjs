#!/usr/bin/node

import { ethers } from 'ethers'
import { RG, SS } from './HelpfulCandlewax/index.mjs'
import { EventEmitter } from 'events'

let { providers: { JsonRpcProvider }, Wallet, ContractFactory } = ethers

new class _ extends EventEmitter {

    constructor() {
        super()
        this.init()
    }

    async init() {
        console.log('initializing')
        Object.assign(this, await new RG({ url: 'VariantEddy', verbose: true }))
        this.provider = new JsonRpcProvider('http://HurtfulBeanstalk:8545')
        this.wallet = new Wallet.createRandom().connect(this.provider)
        this.factory = new ContractFactory(this.abi, this.object, this.wallet)
        this.deploy()
    }

    deploy() {
        console.log('deploying')
        this.factory.deploy()
        .then(this.success.bind(this))
        .catch(this.fail.bind(this))
    }

    async success(contract) {
        console.log('deploy success')
        await contract.deployTransaction.wait()
        await new RG({ url: 'VariantEddy', 'path': '/shutdown', verbose: true })
        let { abi, object } = this
        let { address } = contract
        new SS({ data: { abi, object, address }, verbose: true })
    }

    fail(error) {
        console.log('deploy fail')
        error = error.toString()
        switch (true) {
        case !!error.match('gas required exceeds allowance'): this.drink(); break
        case !!error.match('could not detect network'): this.handleNetworkDetectError(); break
        default: throw error
        }
    }

    async drink() {
        console.log('requesting native from faucet')
        let tx = await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}`, verbose: true })
        await this.provider.waitForTransaction(tx)
        this.deploy()
    }

    handleNetworkDetectError() {
        console.log('network detect error')
        if (!this.start) this.start = Date.now()
        if (Date.now() - this.start >= 30000) throw 'network detect timeout'
        setTimeout(this.deploy.bind(this), 100)
    }

}()