#!/usr/bin/env node
import { readFileSync, write, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

let home = '/app'
let contracts = `${home}/contracts`

let getInvolvedPaths = file => Array.from(readFileSync(file, { encoding: 'utf8'}).matchAll(/import '(.*)'/g)).map(i => resolve(dirname(file), i[1]))
let importsToSources = (path, content) => content.split('\n').map(line => line.match('import') ? `import '${resolve(dirname(path), line.match(/import '(.*)';/)[1]).replace(`${contracts}/`, '')}';` : line ).join('\n')
let pathToSource = path => { return { [path.replace(`${contracts}/`, '')]: { content: importsToSources(path, readFileSync(path, { encoding: 'utf8' })) }}}

let start = `${contracts}/Tangle.sol`
let paths = []
let check = [start]
while (check.length) {
    check.push(...getInvolvedPaths(check[0]).filter(path => [...paths, ...check].indexOf(path) == -1))
    paths.push(check.shift())
}
let output = JSON.stringify({
    language: 'Solidity',
    sources: Object.assign({}, ...paths.map(path => pathToSource(path))),
    settings: { viaIR: true, optimizer: { enabled: true, runs: 65535 }, outputSelection: { 'Tangle.sol': { Tangle: ['abi', 'evm.bytecode.object'] }}}
})
writeFileSync('/tmp/tangle.json', output)
console.log(output)