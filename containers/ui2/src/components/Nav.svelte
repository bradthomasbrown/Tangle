<script lang="ts">
    import Logo from './Logo.svelte'
    import FlexFiller from './FlexFiller.svelte'
    import Connector from './Connector.svelte'
</script>

<div>
    <Logo/>
    <FlexFiller/>
    <Connector/>
</div>

<style>
    div {
        display: flex;
        align-items: center;
    }
</style>