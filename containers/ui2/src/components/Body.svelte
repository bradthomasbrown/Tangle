<script lang="ts">
    import IOs from './IOs.svelte'
    import TradeButton from './TradeButton.svelte'
    // async function handleTrade() {
        // subreqs.forEach(subreq => subreq.dest = getChainId(subreq.dest))
        // console.log(subreqs.map(subreq => Object(subreq)))
        // let value = subreqs.map(subreq => subreq.input)
        //     .reduce((p, c) => p + c)
        // console.log(await tangle.trade(subreqs, { value }))
    // }
</script>

<div>
    <IOs/>
    <TradeButton/>
</div>

<style>
    div {
        margin-top: 20px;
        display: flex;
        gap: 15px;
        flex-direction: column;
        align-items: center;
    }
</style>