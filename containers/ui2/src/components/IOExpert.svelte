<script lang="ts">
    import Switch from "@smui/switch/src/Switch.svelte";
    import FlexFiller from "./FlexFiller.svelte";
    export let expert: boolean
</script>

<div>
    Expert Mode
    <FlexFiller/>
    <Switch bind:checked={expert}></Switch>
</div>

<style>
    div {
        margin-top: 16px;
        display: flex;
        align-items: center;
    }
</style>