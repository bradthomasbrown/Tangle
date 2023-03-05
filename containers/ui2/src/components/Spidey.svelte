<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import { Web3 } from '../stores/Web3.mjs';
    import { fly, scale } from 'svelte/transition';
    let easing = quartInOut
    let inParams = {  duration: 2000, delay: 1000, x: 0, 
        y: Math.min(window.innerWidth / 50, 8) * 50 / 2,  easing }
        let outParams = { duration: 1000, delay: 0, easing }
    $: show = !!$Web3.provider && !$Web3.tangle
    setTimeout(() => {
        inParams = { duration: 1000, delay: 0, x: 0,
            y: document.body.scrollHeight, easing }
    }, 3000)
</script>

{#if show}
    <div in:fly={ inParams } out:scale={ outParams }>
        <img src="/spidey.gif" alt="a cool gif of spiderman dancing">
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
        gap: 10px;
    }
</style>