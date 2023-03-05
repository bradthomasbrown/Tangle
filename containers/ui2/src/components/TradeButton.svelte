<script lang="ts">
    import { fade } from "svelte/transition";
    import Button from "@smui/button/src/Button.svelte";
    import { Subreq } from '../stores/Subreq.mjs'
    import { Web3 } from '../stores/Web3.mjs'
    import CircularProgress from "@smui/circular-progress/src/CircularProgress.svelte";
    let loading = false
    $: tBInsufficient = $Subreq.map(subreq => subreq.gas)
        .reduce((p, c) => c === undefined ? p : p + c, 0n)
        > $Web3.tangleBalance
    $: nBInsufficient = $Subreq.map(subreq => subreq.input)
        .reduce((p, c) => c === undefined ? p : p + c, 0n)
        > $Web3.nativeBalance
    $: disabled = !$Subreq.length ? true
        : $Subreq.map(subreq =>
            !subreq.input
            || !subreq.output 
            || !subreq.dest 
            || subreq.gas === undefined
            || !subreq.work)
        .reduce((p, c) => p || c)
        || tBInsufficient
        || nBInsufficient
        || loading
    function onClick() {
        let value = $Subreq.map(subreq => subreq.input).reduce((p, c) => p + c)
        $Web3.tangle.trade($Subreq, { value })
        loading = true
        setTimeout(() => loading = false, 5000)
    }
</script>

<div transition:fade="{{ duration: 2000 }}">
    <Button
        disabled={disabled}
        variant="unelevated"
        on:click={onClick}
    >
        {#if loading}
            <span>
                <CircularProgress
                    style="height: 24px; width: 24px;"
                    indeterminate
                />
            </span>
        {:else}
            <span>
                Trade
            </span>
        {/if}
    </Button>
</div>

<style>
    span {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 82px;
    }
</style>