import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { Contract, ContractFactory, Wallet } from 'ethers'
import { Cluster } from '../../classes/Cluster.mjs'

let ethtestrpc = 'https://rpc.sepolia.org/'
let bsctestrpc = 'https://data-seed-prebsc-1-s1.binance.org:8545'
let ftmtestrpc = 'https://rpc.testnet.fantom.network/'
let avaxtestrpc = 'https://api.avax-test.network/ext/bc/C/rpc'
let cluster = new Cluster(0)
let compiled = await cluster.compiled
let { tangle } = compiled

{
    let provider = new JsonRpcProvider(avaxtestrpc)
    let wallet = new Wallet(`0x${process.env.testkey}`, provider)
    let factory = new ContractFactory(tangle.abi, tangle.bytecode, wallet)
    // console.log(await provider.getBalance(wallet.address))
    console.log(await factory.deploy())
    // let deployTx = factory.getDeployTransaction()
    // console.log(await provider.estimateGas(deployTx))
}