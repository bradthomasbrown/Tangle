#!/usr/bin/env node 

import { ethers } from 'ethers'
import { RG } from './HelpfulCandlewax/index.mjs'
import { writeFileSync, readFileSync } from 'fs'
import { EventEmitter } from 'events'
let { providers: { JsonRpcProvider }, Wallet, Contract, utils: { defaultAbiCoder, keccak256 } } = ethers

let score = hash => 1n << BigInt(BigInt(hash).toString(2).padStart(256, '0').indexOf(1))

new class _ extends EventEmitter {

    constructor() {
        super()
        this.init()
    }

    async init() {
        console.log('init')
        this.data = await new RG({ url: 'YankeeFootball' })
        this.provider = new JsonRpcProvider('http://HurtfulBeanstalk:8545')
        this.provider.pollingInterval = 100;
        this.wallet = new Wallet.createRandom().connect(this.provider)
        let { Tangle } = this.data
        this.tangle = new Contract(Tangle.address, Tangle.abi, this.wallet)
        this.balances = {}
        await this.drink()
        this.stalk()
    }

    async stalk() {
        console.log('stalking')
        // TODO: if two exchange events happen very quickly, the async-ness here will result in a 'replacement tx...' error
        this.tangle.on('Exchange', input => { this.hunt(input) })
    }

    async hunt(input) {

        if (BigInt(input.id) % 2n != 0n || this.hunting) return
        this.hunting = true

        let requestType = 'tuple(uint chain, uint value)'
        let inputType = `tuple(uint work, ${requestType}[] requests, address sender, uint value, uint id)`
        let outputType = 'tuple(address recipient, uint value)'
        let modifierType = 'tuple(uint index, uint subtrahend)'
        let rolloverType = `tuple(${modifierType} inMod, ${modifierType}[] reqMods)`
        let streamType = `tuple(${inputType}[] inputs, ${outputType}[] outputs, ${rolloverType}[] rollovers, uint chain)`
        let workType = 'tuple(bytes32 root, address worker, uint n)'

        let inputs = [input]
        let outputs = [{ recipient: this.wallet.address, value: input.value }]
        let streams = [{ inputs, outputs, rollovers: [], chain: 8000 }]
        let streamsEncoding = defaultAbiCoder.encode([`${streamType}[] streams`], [streams])
        let streamsHash = keccak256(streamsEncoding)
        let work = { root: streamsHash, worker: this.wallet.address, n: 0 }
        let workEncoding = defaultAbiCoder.encode([`${workType}`], [work])
        let workHash = keccak256(workEncoding)
        let w = score(workHash)
        while (w < input.work) {
            work.n++
            workEncoding = defaultAbiCoder.encode([`${workType}`], [work])
            workHash = keccak256(workEncoding)
            w = score(workHash)
        }
        let works = [work]
        let workProofs = [{ hashes: [], leafIndex: 0, ZSIndex: 0 }]
        let inputProofs = [{ hashes: [], leafIndex: 0, ZSIndex: 0 }]
        let tx = await (await this.tangle.execute(streams, works, workProofs, inputProofs, { gasLimit: 500000 })).wait()
        console.log(tx.cumulativeGasUsed.toString())
        this.hunting = false
    }

    async claim() {
        console.log('claim')
        await (await this.tangle.claim(['stake', 'airdrop']))
    }

    async drink() {
        console.log('drink')
        await this.provider.waitForTransaction(await new RG({ url: 'HurtfulBeanstalk', path: `/${this.wallet.address}` }))
        this.balances.native = await this.provider.getBalance(this.wallet.address)
    }

}()