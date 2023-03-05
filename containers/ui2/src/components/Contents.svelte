<script lang="ts">
    import { Web3 } from '../stores/Web3.mjs'
    import Interactables from './Interactables.svelte'
    import Connector from './Connector.svelte'
    import Spidey from './Spidey.svelte'
    $: spidey = !$Web3.tangle
</script>

<div>
    <Spidey/>
        <!-- <img src="/spidey.gif" alt="a cool gif of spiderman dancing"> -->
    <Connector/>
    <Interactables/>
    <!-- {#if spidey}
        <img src="spidey.gif" alt="a cool gif of spiderman dancing">
    {:else}
        <Balances/>
        <IOs/>
        <TradeButton/>
    {/if} -->
</div>

<style>
    div {
        position: relative;
        display: flex;
        gap: 15px;
        flex-direction: column;
        align-items: center;
    }
</style>