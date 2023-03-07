<script lang="ts">
    import { quartInOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import Header from '../components/Header.svelte'
    import Body from '../components/Body.svelte'
    let disableSignFly = false
    $: console.log(disableSignFly)
    let intro = true
    let introDrawDuration = 2000
    let app = 0
    let _ = false
    setTimeout(() => _ = true)
    setTimeout(() => intro = false, 3000)
</script>
{#if _}
    <div transition:fly={{
        duration: 2000,
        delay: introDrawDuration,
        y: window.innerHeight / 2 - 50 - 20,
        opacity: 1,
        easing: quartInOut
    }}>
        <Header
            bind:disableSignFly
            bind:app
            bind:intro
            bind:introDrawDuration
        />
        <Body
            bind:app
            bind:introDrawDuration
            bind:disableSignFly
        />
    </div>
{/if}

<style>
    div {
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }
</style>