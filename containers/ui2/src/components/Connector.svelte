<script lang="ts">
    import Button from '@smui/button'
    import { Web3, getSigner } from '../stores/Web3.mjs'
</script>

{#if $Web3.ethereum && !$Web3.selectedAddress}
    <Button variant="unelevated" on:click="{getSigner}">
        Connect Wallet
    </Button>
{/if}