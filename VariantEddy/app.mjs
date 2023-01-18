#!/usr/bin/node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { SS } from './HelpfulCandlewax/index.mjs'

let help = '/app/HelpfulCandlewax'

function getHash() {
    return execSync('ls -lR ERC20 Farmable GentleMidnight Tangle | md5sum | tr -d " -"').toString().replace('\n', '')
}

function compile() {
    let compile = execSync('cat compile.json | solc --standard-json')
    let { contracts } = JSON.parse(compile)
    let { Tangle: { abi, evm: { bytecode: { object } } } } = contracts['Tangle.sol']
    let data = { abi, object, hash: getHash() }
    writeFileSync(`${help}/Tangle.json`, JSON.stringify(data))
    return TangleJson
}

let TangleJsonExists = existsSync(`${help}/Tangle.json`)
let TangleJson
if (TangleJsonExists) {
    TangleJson = JSON.parse(readFileSync(`${help}/Tangle.json`, 'utf8'))
    if (getHash() != TangleJson.hash) TangleJson = compile()
} else TangleJson = compile()
let { abi, object } = TangleJson
new SS({ data: { abi, object }, verbose: true })