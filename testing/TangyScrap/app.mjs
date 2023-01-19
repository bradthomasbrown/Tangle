#!/usr/bin/env node 

import { ethers } from 'ethers'
import { RG } from './HelpfulCandlewax/index.mjs'
let { providers: { JsonRpcProvider }, Wallet, Contract } = ethers

new class _ {

    constructor() { this.init() }

    async init() {
        console.log('init')
        this.data = await new RG({ url: 'YankeeFootball' })
        this.provider = new JsonRpcProvider('http://HurtfulBeanstalk:8545')
        this.wallet = new Wallet.createRandom().connect(this.provider)
        let { Tangle, UniswapV2Router02, WETH9 } = this.data
        this.weth = new Contract(WETH9.address, WETH9.abi, this.wallet)
        this.tangle = new Contract(Tangle.address, Tangle.abi, this.wallet)
        this.router = new Contract(UniswapV2Router02.address, UniswapV2Router02.abi, this.wallet)
        this.roll()
    }

    async roll() {
        let roll = Math.random()
        switch (true) {
        case roll <= 0.45: await this.buy(); break
        case roll <= 0.90: this.sell(); break
        case roll <= 0.95: this.addLiquidity(); break
        case roll <= 1.00: this.removeLiquidity(); break }
        setTimeout(_ => { this.roll() }, ((Math.random() * 4) + 1) * 1000)
    }

    async buy() {
        console.log('buy')
        let balance = await this.provider.getBalance(this.wallet.address)
        if (balance <= 0) balance = await this.drink()
        let amountOutMin = 0
        let path = [this.weth.address, this.tangle.address]
        let to = this.wallet.address
        let deadline = parseInt(Date.now() / 1000) + 60
        let value = BigInt(parseInt((Math.random() * 0.2 + 0.05) * balance))
        let gas = await this.router.estimateGas.swapExactETHForTokens(amountOutMin, path, to, deadline, { value })
        let tx = await this.router.swapExactETHForTokens(amountOutMin, path, to, deadline, { value, gasLimit: 250000 })
        await tx.wait()
        console.log((await this.tangle.balanceOf(this.wallet.address)).toString())
    }

    sell() {
        console.log('sell')
    }

    addLiquidity() {
        console.log('addLiquidity')
    }

    removeLiquidity() {
        console.log('removeLiquidity')
    }

    async drink() {
        console.log('drink')
        let tx = await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}` })
        await this.provider.waitForTransaction(tx)
        return await this.provider.getBalance(this.wallet.address)
    }

}()