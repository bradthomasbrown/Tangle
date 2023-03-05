<script lang="ts">
    import Switch from "@smui/switch/src/Switch.svelte";
    import FlexFiller from "./FlexFiller.svelte";
    import { Subreq } from '../stores/Subreq.mjs'
    export let expert: boolean
    $: invalid = $Subreq.map(subreq => subreq.gas === undefined)
        .reduce((p, c) => p || c)
        || $Subreq.map(subreq => !subreq.work)
        .reduce((p, c) => p || c) ? 'invalid' : ''
</script>

<div>
    <span class={invalid}>Expert Mode</span>
    <FlexFiller/>
    <Switch bind:checked={expert}></Switch>
</div>

<style>
    .invalid {
        color: #d32f2f;
    }
    div {
        margin-top: 16px;
        display: flex;
        align-items: center;
    }
</style>