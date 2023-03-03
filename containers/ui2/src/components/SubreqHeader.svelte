<script lang="ts">
    import IconButton from "@smui/icon-button/src/IconButton.svelte"
    import Header from "@smui-extra/accordion/src/Header.svelte"
    // import Subreq from '../classes/Subreq.mjs'
    import FlexFiller from "./FlexFiller.svelte"
    import { Web3 } from '../stores/Web3.mjs'
    // @ts-ignore
    import chains from '../json/chains.json'
    // export let subreqs: Subreq[]
    // export let index: number
    // $: input = subreqs[index] ? metric(subreqs[index].input) : undefined
    // $: output = subreqs[index] ? metric(subreqs[index].output) : undefined
    // $: dest = subreqs[index] ? subreqs[index].dest : undefined
    $: source = chains[$Web3.chainId]?.chainAbbreviation
    function metric(n: bigint) {
        if (n === undefined) return '? '
        if (n === 0n) return '0 '
        let length = `${n}`.length
        let decimals = 18
        let base = length - decimals
        if (base > 0) base = base - 1
        else base = base - 3
        base = base - (base % 3)
        if (base > 30) base = 30
        if (base < -30) base = -30
        let prefix = ''
        switch (base) {
            case  30: prefix = 'Q'; break; case  27: prefix = 'R'; break;
            case  24: prefix = 'Y'; break; case  21: prefix = 'Z'; break;
            case  18: prefix = 'E'; break; case  15: prefix = 'P'; break;
            case  12: prefix = 'T'; break; case   9: prefix = 'G'; break;
            case   6: prefix = 'M'; break; case   3: prefix = 'k'; break;
            case  -3: prefix = 'm'; break; case  -6: prefix = 'μ'; break;
            case  -9: prefix = 'n'; break; case -12: prefix = 'p'; break;
            case -15: prefix = 'f'; break; case -18: prefix = 'a'; break;
            case -21: prefix = 'z'; break; case -24: prefix = 'y'; break;
            case -27: prefix = 'r'; break; case -30: prefix = 'q'; break;
        }
        let nStr = `${n}`
        let sliceEnd = nStr.length - base - decimals
        nStr = nStr.slice(0, sliceEnd)
        return `${nStr} ${prefix}`
    }
    // function handleDelete() {
    //     subreqs.splice(index, 1)
    //     subreqs = subreqs
    // }
</script>

<Header>
    <div>
        <!-- <span>{`${input}${source} > ${output}${dest ?? '?'}`}</span> -->
        <FlexFiller/>
        <!-- <IconButton
            class="material-icons"
            size="button"
            on:click={handleDelete}
        >
            delete
        </IconButton> -->
    </div>
</Header>

<style>
    div {
        display: flex;
        gap: 15px;
        flex-direction: row;
        align-items: center;
        font-family: 'Roboto';
    }
    /* span {
        font-family: 'Roboto Mono', monospace;
        font-size: 12px;
        width: 175px;
    } */
</style>