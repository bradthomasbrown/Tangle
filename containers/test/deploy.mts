import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { Contract, ContractFactory, Wallet } from 'ethers5'
import { Cluster } from '../../classes/Cluster.mjs'

let ethtestrpc = 'https://rpc.sepolia.org/'
let bsctestrpc = 'https://data-seed-prebsc-1-s1.binance.org:8545'
let ftmtestrpc = 'https://rpc.ankr.com/fantom_testnet'
let avaxtestrpc = 'https://api.avax-test.network/ext/bc/C/rpc'
let arbtestrpc = 'https://goerli-rollup.arbitrum.io/rpc'
let cluster = new Cluster(0)
let compiled = await cluster.compiled
let { tangle } = compiled

{
    let provider = new JsonRpcProvider('https://rpc.sepolia.org/')
    let wallet = new Wallet(`0x${process.env.testkey}`, provider)
    // let factory = new ContractFactory(tangle.abi, tangle.bytecode, wallet)
    // console.log(await provider.getBalance(wallet.address))
    let Tangle = new Contract('0xe7223a022b8716a96000f43e266aefe7d791cb58', tangle.abi, wallet)
    console.log(await Tangle.available(['hold']))
    // let tx = factory.getDeployTransaction()
    // console.log(await wallet.estimateGas(tx))
}