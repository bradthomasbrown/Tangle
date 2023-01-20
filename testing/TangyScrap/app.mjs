#!/usr/bin/env node 

import { ethers } from 'ethers'
import { RG } from './HelpfulCandlewax/index.mjs'
import { writeFileSync } from 'fs'
let { providers: { JsonRpcProvider }, Wallet, Contract } = ethers

class _ {

    constructor(x) {
        this.init()
        this.x = x
    }

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

        let weights = {
            buy: 10,
            sell: 10,
            airdrop: 50,
            claim: 5,
            exchange: 2,
            addLiquidity: 1,
            removeLiquidity: 1,
            adjustStake: 1
        }
        let foo = key => Object.values(weights).reduce((p, c, i) => (p[0] += c, p[1] = i == Object.keys(weights).indexOf(key) ? p[0] : p[1], p), [0, 0]).reduce((p, c) => c / p)

        let roll = Math.random()
        switch (true) {
        case roll <= foo('buy'): await this.buy(); break
        case roll <= foo('sell'): await this.sell(); break
        case roll <= foo('airdrop'): await this.airdrop(); break
        case roll <= foo('claim'): await this.claim(); break
        case roll <= foo('exchange'): await this.exchange(); break
        case roll <= foo('addLiquidity'): await this.addLiquidity(); break
        case roll <= foo('removeLiquidity'): await this.removeLiquidity(); break
        case roll <= foo('adjustStake'): await this.adjustStake(); break }
        console.log(parseFloat(await this.tangle.balanceOf(this.wallet.address)) / 1e9)
        let result = await this.tangle.available([{ generator: 'tangle', farm: 'airdrop' }])
        result = result[0].available.toString()
        writeFileSync(`foo-${this.x}`, `${Date.now()}\t${result}\n`, { flag: 'a' })
        setTimeout(_ => { this.roll() }, ((Math.random() * 4) + 1) * this.x)
    }

    async buy() {
        console.log('buy')
        if (await this.provider.getBalance(this.wallet.address) <= 0) await this.drink()
        let balance = await this.provider.getBalance(this.wallet.address)
        let value = BigInt(parseInt((Math.random() * 0.2 + 0.05) * balance))
        let tx = await this.router.swapExactETHForTokens(
            0, 
            [this.weth.address, this.tangle.address], 
            this.wallet.address, 
            parseInt(Date.now() / 1000) + 60, 
            { value, gasLimit: 250000 }
        )
        await tx.wait().catch(error => console.log('buy rejected', error))
    }

    async sell() {
        console.log('sell')
        if (await this.tangle.balanceOf(this.wallet.address) <= 0) return
        let balance = await this.tangle.balanceOf(this.wallet.address)
        let value = BigInt(parseInt((Math.random() * 0.2 + 0.05) * balance))
        if (await this.tangle.allowance(this.wallet.address, this.router.address) < value) await this.approve()
        let tx = await this.router.swapExactTokensForETH(
            value,
            0,
            [this.tangle.address, this.weth.address],
            this.wallet.address,
            parseInt(Date.now() / 1000) + 60,
            { gasLimit: 250000 }
        )
        await tx.wait().catch(error => console.log('sell rejected', error))
    }

    async approve() {
        console.log('approve')
        let tx = await this.tangle.approve(this.router.address, 2n << 128n)
        await tx.wait().catch(error => console.log('approve rejected', error))
    }

    async airdrop() {
        console.log('airdrop')
        if (await this.tangle.balanceOf(this.wallet.address) <= 1e9) return
        let addresses = []
        for (let i = 0; i < 1; i++) addresses.push(new Wallet.createRandom().address)
        let tx = await this.tangle.airdrop(addresses, { gasLimit: 300000 })
        tx = await tx.wait().catch(error => console.log('airdrop rejected', error))
        console.log(tx.cumulativeGasUsed.toString())
    }

    async claim() {
        console.log('claim')
    }

    async exchange() {
        console.log('exchange')
    }

    async addLiquidity() {
        console.log('addLiquidity')
    }

    async removeLiquidity() {
        console.log('removeLiquidity')
    }

    async adjustStake() {
        console.log('adjustStake')
    }

    async drink() {
        console.log('drink')
        let hash = await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}` })
        await this.provider.waitForTransaction(hash)
    }

}

new _(500)