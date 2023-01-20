#!/usr/bin/node

import { ethers } from 'ethers'
import { RG, SS } from './HelpfulCandlewax/index.mjs'

let { providers: { JsonRpcProvider }, Wallet, ContractFactory, constants: { AddressZero }, Contract } = ethers

new class _ {

    constructor() { this.init() }

    async init() {
        console.log('initializing')
        this.data = await new RG({ url: 'VariantEddy', path: '/shutdown', verbose: true })
        this.provider = new JsonRpcProvider('http://HurtfulBeanstalk:8545')
        this.wallet = new Wallet.createRandom().connect(this.provider)
        await this.deploy('Tangle')
        await this.deploy('WETH9')
        await this.deploy('UniswapV2Factory')
        await this.deploy('UniswapV2Router02')
        let { Tangle, UniswapV2Router02 } = this.data
        let tangle = new Contract(Tangle.address, Tangle.abi, this.wallet)
        let router = new Contract(UniswapV2Router02.address, UniswapV2Router02.abi, this.wallet)
        let balance = await tangle.balanceOf(this.wallet.address)
        await tangle.approve(UniswapV2Router02.address, BigInt(balance) / 2n)
        await router.addLiquidityETH(
            this.data.Tangle.address,
            BigInt(balance) / 2n,
            0n,
            0n,
            this.wallet.address,
            BigInt(parseInt(Date.now() / 1000) + 60),
            { value: 1n * 10n ** 17n }
        )
        new SS({ data: this.data, verbose: true })
    }

    async deploy(name) {
        console.log(`deploying ${name}`)
        let { abi, object } = this.data[name]
        let factory = new ContractFactory(abi, object, this.wallet)
        let args = []
        if (name == 'UniswapV2Factory') args = [AddressZero]
        if (name == 'UniswapV2Router02') args = [this.data.UniswapV2Factory.address, this.data.WETH9.address]
        await factory.deploy(...args)
        .then(contract => { return this.success(contract, name) })
        .catch(error => { return this.fail(error, name) })
    }

    async success(contract, name) {
        await contract.deployTransaction.wait()
        console.log(`${name} deploy success, address ${contract.address}`)
        this.data[name].address = contract.address
    }

    async fail(error, name) {
        console.log(`${name} deploy fail`)
        error = error.toString()
        switch (true) {
        case !!error.match('gas required exceeds allowance'): await this.drink(name); break
        case !!error.match('could not detect network'): await this.handleNetworkDetectError(name); break
        default: throw error
        }
    }

    async drink(name) {
        console.log(`${name} faucet request`)
        let tx = await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}` })
        await this.provider.waitForTransaction(tx)
        await this.deploy(name)
    }

    async handleNetworkDetectError(name) {
        console.log(`${name} network detect error`)
        if (!this.start) this.start = Date.now()
        if (Date.now() - this.start >= 30000) throw 'network detect timeout'
        await new Promise(_ => setTimeout(_, 100))
        await this.deploy(name)
    }

}()