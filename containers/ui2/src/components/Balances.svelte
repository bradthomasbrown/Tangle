<script lang="ts">
    import Paper from "@smui/paper/src/Paper.svelte"
    import { Web3 } from "../stores/Web3.mjs"
    import { Subreq } from "../stores/Subreq.mjs";
    import chains from '../../../../json/chains.json'
    import CircularProgress from "@smui/circular-progress/src/CircularProgress.svelte";
    let fmt_tB = undefined
    let fmt_nB = undefined
    $: str_tB = $Web3.tangleBalance
    $: str_nB = $Web3.nativeBalance
    $: {
        if (str_tB !== undefined && str_nB != undefined) {
            fmt_tB = `${str_tB}`.padStart(9, '0')
            if (fmt_tB.length == 9) fmt_tB = `0.${fmt_tB}`
            else fmt_tB = `${fmt_tB.slice(0, fmt_tB.length - 9)}.${fmt_tB.slice(fmt_tB.length - 9)}`
            fmt_tB = fmt_tB.replace(/\.?0+$/, '')
            fmt_nB = `${str_nB}`.padStart(18, '0')
            if (fmt_nB.length == 18) fmt_nB = `0.${fmt_nB}`
            else fmt_nB = `${fmt_nB.slice(0, fmt_nB.length - 18)}.${fmt_nB.slice(fmt_nB.length - 18)}`
            fmt_nB = fmt_nB.replace(/\.?0+$/, '')
        }
    }
    $: n_labl = chains[$Web3.chainId]?.nativeCurrency.symbol.padEnd(4, ' ')
        ?? 'NATV'
    $: tBInsufficient = $Subreq.map(subreq => subreq.gas)
        .reduce((p, c) => c === undefined ? p : p + c, 0n)
        > $Web3.tangleBalance ? 'insufficient' : ''
    $: nBInsufficient = $Subreq.map(subreq => subreq.input)
        .reduce((p, c) => c === undefined ? p : p + c, 0n)
        > $Web3.nativeBalance ? 'insufficient' : ''
</script>

<Paper variant="outlined" color="secondary" style="border-color: white">
    <span class="floating-label">Balances</span>
    <div>
        {#if fmt_tB !== undefined && fmt_nB !== undefined}
            <pre class={tBInsufficient}>{`TNGL ${fmt_tB}`}</pre>
            <pre class={nBInsufficient}>{`${n_labl} ${fmt_nB}`}</pre>
        {:else}
            <span>
                <CircularProgress
                    style="height: 21px; width: 21px"
                    indeterminate
                />
            </span>
        {/if}
    </div>
</Paper>

<style>
    .insufficient {
        color: #d32f2f;
    }
    div {
        font-family: 'Roboto mono' monospace;
        font-size: 16px;
        width: 227px;
        display: flex;
        flex-direction: column;
    }
    pre {
        font-family: 'Roboto mono';
        width: 225px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin: 0;
        white-space: pre;
    }
    span {
        display: flex;
        width: 100%;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    .floating-label {
        font-family: 'Roboto', sans-serif;
        position: absolute;
        width: auto;
        transform: translateY(-21px) translateX(-17px) scale(0.75)
    }
</style>