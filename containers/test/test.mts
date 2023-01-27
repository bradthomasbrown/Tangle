import { writeFile } from 'fs/promises';
import { Cluster } from '../../classes/index.mjs'
import { readFileSync, writeFileSync } from 'fs';

console.log('creating cluster')
let cluster = new Cluster(1)
console.log('waiting for cluster.ready')
await cluster.ready
console.log('writing to chain1 via pipes/chain1')
writeFileSync('pipes/chain1', cluster.chains[0].wallet.address)

console.log('waiting for response from chain1 via pipes/chain1')
console.log(readFileSync('pipes/chain1'))

console.log('killing clusters')
cluster.kill()

// let cluster = new Cluster(2)
// await cluster.deployed.catch(handleCatch)
// cluster.chains.forEach((chain, i) => 
//     ['tangle', 'weth', 'factory', 'router'].forEach(name => 
//         console.log(`address of ${name} on chain ${i}: ${chain.contracts[name].address}`)))