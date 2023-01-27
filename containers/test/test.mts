import { Cluster } from '../../classes/index.mjs'
import { compile, handleCatch } from '../../functions/index.mjs'

let cluster = new Cluster(2)
console.log(await cluster.compiled)
// cluster.kill()


// await cluster.ready()
// await cluster.deploy().catch(handleCatch)