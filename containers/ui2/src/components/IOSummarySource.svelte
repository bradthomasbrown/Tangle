<script lang="ts">
    import { Web3 } from '../stores/Web3.mjs'
    import CircularProgress from '@smui/circular-progress'
    // @ts-ignore
    import chains from '../json/chains.json'
    $: source = chains[$Web3.chainId]?.chainAbbreviation
        ?? $Web3.chainId
</script>

{#if source === undefined}
    <div>
        <CircularProgress
            style="height: 12px; width: 12px;"
            indeterminate
        />
    </div>
{:else}
    {source}
{/if}

<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 7px;
    }
</style>