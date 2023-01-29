import { Cluster } from '../../classes/index.mjs'

let cluster = new Cluster(1)
await cluster.deployed
cluster.kill()