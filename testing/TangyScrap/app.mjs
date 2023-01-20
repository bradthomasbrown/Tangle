#!/usr/bin/env node 

import { ethers } from 'ethers'
import { RG } from './HelpfulCandlewax/index.mjs'
import { writeFileSync } from 'fs'
let { providers: { JsonRpcProvider }, Wallet, Contract } = ethers

let ERC20Abi = [
    {
        inputs: [
            { internalType: 'address', name: 'spender', type: 'address' },
            { internalType: 'uint256', name: 'value', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address'}],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
]

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

let foo = () => Object.entries(weights).reduce((p, c, _, a) => p - c[1] < 0 ? (a.splice(1), c[0]): p - c[1], Math.random() * Object.values(weights).reduce((p, c) => p + c))

class _ {

    constructor(x) {
        this.init()
        this.x = x
    }

    async init() {
        console.log('init')
        this.balances = { tangle: 0, native: 0, liquidity: 0 }
        this.data = await new RG({ url: 'YankeeFootball' })
        this.provider = new JsonRpcProvider('http://HurtfulBeanstalk:8545')
        this.wallet = new Wallet.createRandom().connect(this.provider)
        let { Tangle, UniswapV2Router02, WETH9, UniswapV2Factory } = this.data
        this.tangle = new Contract(Tangle.address, Tangle.abi, this.wallet)
        this.weth = new Contract(WETH9.address, WETH9.abi, this.wallet)
        this.factory = new Contract(UniswapV2Factory.address, UniswapV2Factory.abi, this.wallet)
        this.router = new Contract(UniswapV2Router02.address, UniswapV2Router02.abi, this.wallet)
        let liquidityAddress = await this.factory.getPair(this.weth.address, this.tangle.address)
        this.liquidity = new Contract(liquidityAddress, ERC20Abi, this.wallet)
        this.paths = {
            tangle: [this.weth.address, this.tangle.address],
            weth: [this.tangle.address, this.weth.address]
        }
        await this.drink()
        await this.approve()
        this.roll()
    }

    async roll() {
        let action = foo(); console.log(action); await this[action]()
        this.balances.native = await this.provider.getBalance(this.wallet.address)
        this.balances.tangle = await this.tangle.balanceOf(this.wallet.address)
        this.balances.liquidity = await this.liquidity.balanceOf(this.wallet.address)
        await this.log()
        setTimeout(_ => { this.roll() }, ((Math.random() * 4) + 1) * this.x)
    }

    async buy() {
        await (await this.router.swapExactETHForTokens(
            0, 
            this.paths.tangle, 
            this.wallet.address, 
            this.nowPlus(60), 
            { 
                value: this.rand(this.balances.native), 
                gasLimit: 250000 
            }
        )).wait()
    }

    async sell() {
        if (this.balances.tangle == 0) return
        await (await this.router.swapExactTokensForETH(
            this.rand(this.balances.tangle),
            0,
            this.paths.weth,
            this.wallet.address,
            this.nowPlus(60),
            { gasLimit: 250000 }
        )).wait()
    }

    async airdrop() {
        let count = 1
        if (await this.tangle.balanceOf(this.wallet.address) <= 1e9 * count) return
        let addresses = []
        for (let i = 0; i < count; i++) addresses.push(new Wallet.createRandom().address)
        await (await this.tangle.airdrop(addresses, { gasLimit: 270000 + 30000 * count })).wait()
    }

    async claim() {

    }

    async exchange() {

    }

    async addLiquidity() {
        if (this.balances.tangle == 0 || this.balances.native == 0) return
        await (await this.router.addLiquidityETH(
            this.tangle.address,
            this.rand(this.balances.tangle),
            0,
            0,
            this.wallet.address,
            this.nowPlus(60),
            { value: this.rand(this.balances.native), gasLimit: 500000 }
        )).wait()
    }

    async removeLiquidity() {
        if (this.balances.liquidity == 0) return
        await (await this.router.removeLiquidityETH(
            this.tangle.address,
            this.rand(this.balances.liquidity),
            0,
            0,
            this.wallet.address,
            this.nowPlus(60),
            { gasLimit: 500000 }
        )).wait()
    }

    async adjustStake() {
        
    }

    async drink() {
        console.log('drink')
        await this.provider.waitForTransaction(await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}` }))
    }

    async approve() {
        console.log('approve')
        await (await this.tangle.approve(this.router.address, 2n << 128n)).wait()
        await (await this.liquidity.approve(this.router.address, 2n << 128n)).wait()
    }

    foo(value) {
        return BigInt(parseInt((Math.random() * 0.2 + 0.05) * value))
    }

    async log() {
        writeFileSync('foo', `${this.balances.native},${this.balances.tangle},${this.balances.liquidity}\n`, { flag: 'a'})
    }

    nowPlus(x) {
        return parseInt(Date.now() / 1000) + x
    }

    rand(x) {
        return BigInt(parseInt((Math.random() * 0.2 + 0.05) * x))
    }

}

new _(500)