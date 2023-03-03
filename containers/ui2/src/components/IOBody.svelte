<script lang="ts">
    import { Content } from "@smui-extra/accordion";
    import IOInput from './IOInput.svelte'
    import IOOutput from './IOOutput.svelte'
    import IODest from './IODest.svelte'
    import IOGas from './IOGas.svelte'
    import IOWork from './IOWork.svelte'
    import IOExpert from './IOExpert.svelte'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    let expert = false
</script>

<Content>
    <div>
        <IOInput bind:subreq/>
        <IOOutput bind:subreq/>
        <IODest bind:subreq/>
        {#if expert}
            <IOGas bind:subreq/>
            <IOWork bind:subreq/>
        {/if}
        <IOExpert bind:expert/>
    </div>
</Content>

<style>
    div {
        display: flex;
        flex-direction: column;
    }
</style>