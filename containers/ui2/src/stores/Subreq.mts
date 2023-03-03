import { writable, type Writable } from 'svelte/store'
interface Subreq {
    gas?: bigint
    work?: bigint
    dest?: string
    input?: bigint
    output?: bigint
}
let Subreq: Writable<Subreq[]> = writable([{
    input: 0n,
    output: 0n,
    dest: undefined,
    work: 1000000000n,
    gas: 1000000000n
}]);
export { Subreq }