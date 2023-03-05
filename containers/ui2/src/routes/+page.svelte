<script lang="ts">
    import Logo from '../components/Logo.svelte';
    import { fly } from 'svelte/transition';
    import { quartInOut } from 'svelte/easing';
    import Contents from '../components/Contents.svelte'
    import { Web3 } from '../stores/Web3.mjs';
    let condition = false
    setTimeout(() => condition = true)
</script>

{#if condition}
    <div transition:fly={{
        duration: 2000,
        delay: 1000,
        y: window.innerHeight / 2 - 50 - 20,
        opacity: 1,
        easing: quartInOut
    }}>
        <Logo/>
        <Contents/>
    </div>
{/if}

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }
</style>