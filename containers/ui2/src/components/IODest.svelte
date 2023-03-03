<script lang="ts">
    // @ts-ignore
    import chains from '../json/chains.json'
    import Select, { Option } from '@smui/select'
    import { Subreq } from '../stores/Subreq.mjs'
    import { Web3 } from '../stores/Web3.mjs'
    export let subreq: Subreq
    $: otherChains = Object.values(chains)
        .filter((chain: any) => chain.id != $Web3.chainId) as any[]
    Web3.subscribe(() => {
        if (subreq.dest == $Web3.chainId) subreq.dest = undefined
        subreq = subreq
    })
</script>

<Select
    label="Destination"
    invalid={!subreq.dest}
    bind:value={subreq.dest}
>
    {#each otherChains as chain (chain)}
        <Option value={chain.id}>{chain.chainAbbreviation}</Option>
    {/each}
</Select>