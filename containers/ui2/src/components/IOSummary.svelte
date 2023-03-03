<script lang="ts">
    import IOSummarySource from './IOSummarySource.svelte'
    import IOSummaryInput from './IOSummaryInput.svelte'
    import IOSummaryDest from './IOSummaryDest.svelte'
    import IOSummaryOutput from './IOSummaryOutput.svelte'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
</script>

<div>
    <IOSummaryInput bind:subreq/><IOSummarySource/>
    >
    <IOSummaryOutput bind:subreq/><IOSummaryDest bind:subreq/>
</div>

<style>
    div {
        width: 175px;
        font-family: 'Roboto mono', monospace;
        font-size: 12px;
        display: flex;
    }
</style>