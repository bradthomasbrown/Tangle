#!/usr/bin/env node 

import { ethers } from 'ethers'
import { RG } from './HelpfulCandlewax/index.mjs'
import { writeFileSync, readFileSync } from 'fs'
let { providers: { JsonRpcProvider }, Wallet, Contract, utils: { defaultAbiCoder, keccak256 } } = ethers

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
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
]

// let weights = {
//     buy: 1,
//     sell: 1,
//     airdrop: 1,
//     claim: 0.01,
//     exchange: 0.01,
//     addLiquidity: 1,
//     removeLiquidity: 1,
//     adjustStake: 1
// }

// let foo = () => Object.entries(weights).reduce((p, c, _, a) => p - c[1] < 0 ? (a.splice(1), c[0]): p - c[1], Math.random() * Object.values(weights).reduce((p, c) => p + c))

new class _ {

    constructor(x) {
        this.x = x
        this.init()
    }

    async init() {
        console.log('init')
        writeFileSync(`tmp/foo-${this.x}`, `time,action,bal_N,bal_T,bal_L,points_A,points_S,avail_A,avail_S\n`)
        this.data = await new RG({ url: 'YankeeFootball' })
        this.provider = new JsonRpcProvider('http://HurtfulBeanstalk:8545')
        this.wallet = new Wallet.createRandom().connect(this.provider)
        let { Tangle, UniswapV2Router02, WETH9 } = this.data
        this.tangle = new Contract(Tangle.address, Tangle.abi, this.wallet)
        this.weth = new Contract(WETH9.address, WETH9.abi, this.wallet)
        this.router = new Contract(UniswapV2Router02.address, UniswapV2Router02.abi, this.wallet)
        this.liquidity = new Contract(await this.tangle.liquidity(), ERC20Abi, this.wallet)
        this.paths = { tangle: [this.weth.address, this.tangle.address], weth: [this.tangle.address, this.weth.address] }
        this.balances = {}
        this.points = {}
        this.available = {}
        await this.update()
        await this.log('init')
        await this.drink()
        await this.approve()
        await this.buy()
        await this.exchange()
        await this.sell()
        // this.roll()
    }

    // async roll() {
    //     await this[foo()]()
    //     setTimeout(_ => { this.roll() }, (Math.random() * 0.50 + 0.75) * this.x)
    // }

    async buy() {
        console.log('buy')
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
        await this.update()
        await this.log('buy')
    }

    async sell() {
        console.log('sell')
        if (this.balances.tangle == 0) return
        await (await this.router.swapExactTokensForETH(
            this.rand(this.balances.tangle),
            0,
            this.paths.weth,
            this.wallet.address,
            this.nowPlus(60),
            { gasLimit: 250000 }
        )).wait()
        await this.update()
        await this.log('sell')
    }

    async airdrop() {
        console.log('airdrop')
        let count = 10
        if (await this.tangle.balanceOf(this.wallet.address) <= 1e9 * count) return
        let addresses = []
        for (let i = 0; i < count; i++) addresses.push(new Wallet.createRandom().address)
        await (await this.tangle.airdrop(addresses, { gasLimit: 270000 + 30000 * count })).wait()
        await this.update()
        await this.log('airdrop')
    }

    async claim() {
        console.log('claim')
        await (await this.tangle.claim(['stake', 'airdrop']))
        await this.update()
        await this.log('claim')
    }

    async exchange() {
        console.log('exchange')
        let work = 100
        let requests = [{ chain: 8001, value: 75n * 10n ** 14n }]
        let sender = this.wallet.address
        let value = 1n * 10n ** 16n
        let count = await this.tangle.count()
        let input = { work, requests, sender, value, count }
        let gas = 100n * 10n ** 9n
        await (await this.tangle.exchange(input.work, input.requests, gas, { value: input.value })).wait()
        await this.update()
        await this.log('exchange')
    }

    async addLiquidity() {
        console.log('addLiquidity')
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
        await this.update()
        await this.log('addLiquidity')
    }

    async removeLiquidity() {
        console.log('removeLiquidity')
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
        await this.update()
        await this.log('removeLiquidity')
    }

    async adjustStake() {
        console.log('adjustStake')
        let points = parseFloat((await this.tangle.points([{ generator: 'tangle', farm: 'stake' }]))[0])
        let balance = parseFloat(this.balances.liquidity)
        if (points == 0 && balance == 0) return
        let amount = BigInt(Math.round(Math.random() * (points + balance) - points))
        await (await this.tangle.adjustStake(amount, { gasLimit: 300000 })).wait()
        await this.update()
        await this.log('adjustStake')
    }

    async drink() {
        console.log('drink')
        await this.provider.waitForTransaction(await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}` }))
        this.balances.native = await this.provider.getBalance(this.wallet.address)
        await this.update()
        await this.log('drink')
    }

    async approve() {
        console.log('approve')
        await (await this.tangle.approve(this.tangle.address, 2n << 128n)).wait()
        await (await this.tangle.approve(this.router.address, 2n << 128n)).wait()
        await (await this.liquidity.approve(this.tangle.address, 2n << 128n)).wait()
        await (await this.liquidity.approve(this.router.address, 2n << 128n)).wait()
    }

    foo(value) {
        return BigInt(parseInt((Math.random() * 0.2 + 0.05) * value))
    }

    async log(action) {
        let balances = `${this.balances.native / 1e18},${this.balances.tangle / 1e9},${this.balances.liquidity / 1e18}`
        let points = `${this.points.airdrop},${this.points.stake}`
        let available = `${this.available.airdrop / 1e9},${this.available.stake / 1e9}`
        writeFileSync(`tmp/foo-${this.x}`, `${this.now},${action},${balances},${points},${available}\n`, { flag: 'a'})
    }

    nowPlus(x) {
        return parseInt(Date.now() / 1000) + x
    }

    rand(x) {
        return BigInt(parseInt((Math.random() * 0.2 + 0.05) * x))
    }

    async update() {
        this.now = await this.tangle._now()
        this.balances.native = await this.provider.getBalance(this.wallet.address)
        this.balances.tangle = await this.tangle.balanceOf(this.wallet.address)
        this.balances.liquidity = await this.liquidity.balanceOf(this.wallet.address)
        let points = await this.tangle.points(['airdrop', 'stake'])
        this.points.airdrop = points[0]
        this.points.stake = points[1]
        let available = await this.tangle.available(['airdrop', 'stake'])
        this.available.airdrop = available[0]
        this.available.stake = available[1]
    }

}(1000)