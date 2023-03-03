<script lang="ts">
    import IOAddButton from './IOAddButton.svelte'
    import Accordion from "@smui-extra/accordion/src/Accordion.svelte";
    import IO from './IO.svelte'
    import { Subreq } from '../stores/Subreq.mjs'
</script>

<div>
    <Accordion style="z-index: 1;">
        {#each $Subreq as subreq (subreq)}
            <IO bind:subreq/>
        {/each}
    </Accordion>
    <IOAddButton/>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }
</style>