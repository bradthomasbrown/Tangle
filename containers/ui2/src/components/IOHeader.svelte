<script lang="ts">
    import IOSummary from './IOSummary.svelte'
    import IODeleteButton from './IODeleteButton.svelte'
    import { Header } from "@smui-extra/accordion";
    import FlexFiller from "./FlexFiller.svelte";
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
</script>

<Header>
    <div>
        <IOSummary bind:subreq/>
        <FlexFiller/>
        <IODeleteButton bind:subreq/>
    </div>
</Header>

<style>
    div {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>