import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { Contract, ContractFactory, Wallet } from 'ethers5'
import { Cluster } from '../../classes/Cluster.mjs'

let rpcs = [
    'https://rpc.sepolia.org/',
    'https://data-seed-prebsc-1-s1.binance.org:8545',
    'https://rpc.ankr.com/fantom_testnet',
    'https://api.avax-test.network/ext/bc/C/rpc',
]
// let cluster = new Cluster(0)
// let compiled = await cluster.compiled
// let { tangle } = compiled
// console.log(tangle.bytecode)

rpcs.forEach(async (rpc, i) => {
    let provider = new JsonRpcProvider(rpc)
    if (i == 0) console.log(await provider.getCode('0x8C7A8d4058F5585e32Dd4Cef4581284c612B90Db'))
    // let wallet = new Wallet(`0x${process.env.testkey}`, provider)
    // if (i == 0) console.log(wallet.address)
    // let balance = await provider.getBalance(wallet.address)
    // let factory = new ContractFactory(tangle.abi, tangle.bytecode, wallet)
    // let tx = factory.getDeployTransaction()
    // let gas = await wallet.estimateGas(tx)
    // console.log(`balance ${balance} gas ${gas} balance > gas ${balance.gt(gas)} nonce ${await wallet.getTransactionCount()}`)
    // let contract = await factory.deploy()
    // console.log(`${rpc} ${contract.address}`)
})