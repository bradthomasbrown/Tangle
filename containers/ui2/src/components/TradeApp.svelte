<script lang="ts">
    import { cubicInOut } from "svelte/easing";
    import { fly } from "svelte/transition";
    import { Apps } from "../enum/Apps.mjs"
    import TradeBase from "./TradeBase.svelte";
    import TradeProv from "./TradeProv.svelte";
    import TradeSign from "./TradeSign.svelte";
    import { Web3 } from '../stores/Web3.mjs'
    import SuggestMetamask from "./SuggestMetamask.svelte";
    import SuggestConnect from './SuggestConnect.svelte'
    import Spidey from './Spidey.svelte'
    export let app: number
    export let disableSignFly: boolean
    let easing = cubicInOut
    let prevApp = app
    let inFlyParams = { duration: 333, x: 250, easing }
    let outFlyParams = { duration: 333, x: -250, easing }
    $: {
        let x = 250
        if (app < prevApp) x = -x
        inFlyParams = { duration: 333, x, easing }
        outFlyParams = { duration: 333, x: -x, easing }
        prevApp = app
    }
</script>

{#if prevApp === Apps.indexOf('Trade')}
    {#if $Web3.ethereum && !$Web3.tangle}
        <Spidey/>
    {:else}
        <span>
            <div in:fly={inFlyParams} out:fly={outFlyParams}>
                <TradeBase/>
                {#if $Web3.ethereum}
                    <TradeProv/>
                    <pre>
                        {#if !!$Web3.signer}
                            <TradeSign bind:disableSignFly/>
                        {:else}
                            <SuggestConnect bind:disableSignFly/>
                        {/if}
                    </pre>
                {:else}
                    <SuggestMetamask/>
                {/if}
            </div>
        </span>
    {/if}
{/if}

<style>
    div {
        flex-wrap: wrap;
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 15px;
    }
    span {
        display: flex;
        justify-content: center;
    }
    pre {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        margin: 0;
        white-space: normal;
    }
</style>