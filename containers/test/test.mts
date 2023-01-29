import { Cluster } from '../../classes/index.mjs'

console.log('creating cluster')
let cluster = new Cluster(1)
console.log('waiting for cluster.deployed')
await cluster.deployed
console.log('killing clusters')
cluster.kill()