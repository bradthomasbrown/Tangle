<script lang="ts">
    import { Content } from "@smui-extra/accordion"
    // import Textfield from '@smui/textfield'
    import Select, { Option } from "@smui/select"
    import Switch from '@smui/switch'
    // @ts-ignore
    import chains from '../json/chains.json'
    import { Web3 } from '../stores/Web3.mjs'
    // export let subreqs: Subreq[]
    // export let index: number
    // let subreq = subreqs[index]
    // let inputStr: string = `${Number(subreq.input) / 1e18}`
    // let outputStr: string = `${Number(subreq.output) / 1e18}`
    // let gasStr: string = `${subreq.gas}`
    // let workStr: string = `${subreq.work}`
    // let inputValid: boolean = false
    // let outputValid: boolean = false
    // let gasValid: boolean = true
    // let workValid: boolean = true
    let value: string = undefined
    let switchValue: boolean = false
    $: selectInvalid = !value
    // $: subreqs[index].dest = value
    // $: {
    //     try {
    //         subreqs[index].work = BigInt(workStr)
    //     } catch (e) {
    //         subreqs[index].work = undefined
    //     }
    // }
    // $: {
    //     try {
    //         subreqs[index].gas = BigInt(gasStr)
    //     } catch (e) {
    //         subreqs[index].gas = undefined
    //     }
    // }
    // $: workValid = subreqs[index].work !== undefined
    //     && subreqs[index].work !== 0n
    // $: gasValid = subreqs[index].gas !== undefined
    $: otherChains = Object.values(chains)
        .filter((chain: any) => chain.id != $Web3.chainId)
        .map((chain: any) => chain.chainAbbreviation)
    // function handleInput(event: Event, type: string) {
    //     try {
    //         let target = event.target as HTMLInputElement
    //         let valueStr = target.value
    //         let index = valueStr.indexOf('.')
    //         let nodot = valueStr.replace('.', '')
    //         let value = BigInt(nodot) * 10n ** 18n
    //             / (index == -1
    //                 ? 1n
    //                 : 10n ** BigInt(nodot.length - index))
    //         // subreq[type] = value
    //         // subreqs = subreqs
    //         if (type == 'input') inputValid = value != 0n
    //         else outputValid = value != 0n
    //     } catch (e) {
    //         // subreq[type] = undefined
    //         // subreqs = subreqs
    //         if (type == 'input') inputValid = false
    //         else outputValid =  false
    //     }
    // }
</script>

<Content>
    <div>
        <!-- <Textfield
            label="Input"
            bind:value={inputStr}
            on:input={(event) => handleInput(event, 'input')}
            invalid={!inputValid}
        >
        </Textfield> -->
        <!-- <Textfield
            label="Output"
            bind:value={outputStr}
            on:input={(event) => handleInput(event, 'output')}
            invalid={!outputValid}
        >
        </Textfield> -->
        <Select
            bind:value
            label="Destination"
            invalid={selectInvalid}
        >
            {#each otherChains as chain (chain)}
                <Option value={chain}>{chain}</Option>
            {/each}
        </Select>
        {#if switchValue}
            <!-- <Textfield
                label="Work"
                bind:value={workStr}
                invalid={!workValid}
            >
            </Textfield> -->
            <!-- <Textfield
                label="Gas"
                bind:value={gasStr}
                invalid={!gasValid}
            >
            </Textfield> -->
        {/if}
    </div>
    <div class="options">
        <span>Expert Mode</span>
        <Switch bind:checked={switchValue}/>
    </div>
</Content>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    span {
        display: flex;
        align-items: center;
    }
    .options {
        flex-direction: row;
        justify-content: space-around;
        margin-top: 16px;
    }
</style>