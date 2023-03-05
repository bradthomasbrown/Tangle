<script lang="ts">
    import Button from '@smui/button'
    import { quartInOut } from 'svelte/easing';
    import { fly, scale } from 'svelte/transition';
    import { Web3, getSigner } from '../stores/Web3.mjs'
    let easing = quartInOut
    let inParams = {  duration: 2000, delay: 1000, x: 0, 
        y: Math.min(window.innerWidth / 50, 8) * 50 / 2,  easing }
    let outParams = { duration: 1000, delay: 0, easing }
    $: show = $Web3.ethereum && !$Web3.selectedAddress && !!$Web3.tangle
    setTimeout(() => {
        inParams = { duration: 1000, delay: 0, x: 0,
            y: document.body.scrollHeight, easing }
    }, 3000)
</script>

{#if show}
    <div in:fly={ inParams } out:scale={ outParams }>
        <Button variant="unelevated" on:click="{getSigner}">
            Connect Wallet
        </Button>
    </div>
{/if}

<style>
    div {
        position: absolute;
        top: 0;
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>