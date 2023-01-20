#!/usr/bin/node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { SS } from './HelpfulCandlewax/index.mjs'

let conf = {
    Tangle: {
        dir: 'Tangle/contracts',
        compilerPath: './Tangle/compile'
    },
    WETH9: {
        dir: 'Uniswap/WETH9',
        compilerPath: './Uniswap/compile/WETH9'
    },
    UniswapV2Factory: {
        dir: 'Uniswap/v2-core',
        compilerPath: './Uniswap/compile/UniswapV2Factory'
    },
    UniswapV2Router02: {
        dir: 'Uniswap/v2-periphery Uniswap/v2-core',
        compilerPath: './Uniswap/compile/UniswapV2Router02'
    }
}

function getHash(contract) {
    let { dir } = conf[contract]
    return execSync(`ls -lR ${dir} | md5sum | tr -d " -"`).toString().replace('\n', '')
}

function compile(contract) {
    console.log(`compiling ${contract}`)
    let { compilerPath } = conf[contract]
    let compile = execSync(`${compilerPath}/compile`)
    console.log(JSON.parse(compile))
    let { contracts } = JSON.parse(compile)
    let { [contract]: { abi, evm: { bytecode: { object } } } } = contracts[contract]
    let data = { abi, object, hash: getHash(contract) }
    writeFileSync(`./tmp/${contract}.json`, JSON.stringify(data))
    return data
}

let names = Object.keys(conf)
let contracts = {}
for (let i = 0; i < names.length; i++) {
    let name = names[i]
    let exists = existsSync(`./tmp/${name}.json`)
    let json = exists ? JSON.parse(readFileSync(`./tmp/${name}.json`, 'utf8')) : compile(name)
    if (exists && getHash(name) != json.hash) json = compile(name)
    let { abi, object } = json
    contracts[name] = { abi, object }
}
new SS({ data: contracts, verbose: true })