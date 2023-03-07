<script lang="ts">
    import TradeApp from '../components/TradeApp.svelte';
    import FaucetApp from '../components/FaucetApp.svelte';
    import { fade } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import Snackbar, { Label, Actions } from '@smui/snackbar'
    export let app: number
    export let introDrawDuration: number
    export let disableSignFly: boolean
    let easing = cubicInOut
</script>

<Snackbar>
    <Label>This is a snackbar</Label>
</Snackbar>


<div
    in:fade={{
        duration: 500,
        delay: introDrawDuration + 1500,
        easing
    }}
>
    <TradeApp bind:app bind:disableSignFly/>
    <FaucetApp bind:app bind:disableSignFly/>
</div>

<style>
    div {
        width: 100%;
        margin-right: auto;
        display: flex;
        position: relative;
        justify-content: center;
    }
</style>