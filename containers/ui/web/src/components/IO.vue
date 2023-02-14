<script lang="ts">
import Chain from './Chain.vue'
import chains from '@/json/chains.json' assert { type: "json" }

export default {
    components: { Chain },
    props: ['type', 'selected', 'i', 'input', 'balance', 'outputs'],
    data() {
        return {
            showOptions: false,
            chains: chains
        }
    },
    mounted() {
        let ethereum = window['ethereum']
        if (!ethereum) return
        if (this.type == 'from')
            this.$emit('selectedChange', {
                i: this.i,
                selected: ethereum.chainId
            })
        if (this.type == 'to')
            this.$emit('selectedChange', {
                i: this.i,
                selected: Object.keys(this.chains).filter(chain => chain != ethereum.chainId)[this.i - 1]
            })
    },
    methods: {
        focusout(e: FocusEvent) {
            if (!e.target['contains'](e.relatedTarget))
                this.showOptions = false
        },
        selectedChange(e: any) {
            this.$emit('selectedChange', {
                i: this.i,
                selected: e.selected
            })
        },
        setInputVal(e: Event) {
            let value = e.target['value']
            let input = isNaN(value) || value === '' ? undefined : BigInt(value * 1e18)
            this.$emit('inputChange', input)
        },
        setOutputVal(e: Event) {
            let value = e.target['value']
            let output = isNaN(value) || value === '' ? undefined : BigInt(value * 1e18)
            this.$emit('outputChange', { i: this.i - 1, n: output })
        }
    },
    computed: {
        readableBalance() {
            if (!this.selected[this.i]) return
            if (!chains[this.selected[this.i]]) return
            return `${parseInt(String(this.balance / 1e9)) / 1e9} ${chains[this.selected[this.i]].nativeCurrency.symbol}`;
        }
    }
}
</script>

<template>
    <div class="input-container">
        <div class="input-container-header">
            <div> {{ type }} </div>
            <div class="filler"></div>
            <div v-show="type == 'from'">
                Balance
                <span class="numeric">{{ readableBalance }}</span>
            </div>
        </div>
        <div class="input-container-body">
            <div class="input-container-body-object">
                <input v-if="type == 'from'" @input="setInputVal">
                <input v-if="type == 'to'" @input="setOutputVal">
                <div class="line"></div>
            </div>
            <Chain
                :name="selected[i]"
                @click="showOptions = !showOptions"
                :focusout="focusout"
                :selected="selected[i]"
                :i="0"
                @selectedChange="selectedChange"
            >
                <div class="options" :hidden="!showOptions" @click.stop>
                    <Chain
                        v-for="(chain, i) in Object.keys(chains).filter(chain => chain != selected[i])"
                        :name="chain"
                        :focusout="focusout"
                        :selected="selected"
                        @click="showOptions = false"
                        :i="i + 1"
                        @selectedChange="selectedChange"
                    />
                </div>
            </Chain>
        </div>
    </div>
</template>

<style scoped>

.input-container {
    display: flex;
    flex-direction: column;
    background-color: rgba(22,7,9,1);
    color: #f5f5ff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border-radius: 12px;
    width: 100%;
    padding: 12.5px 0px;
    gap: 10px;
    max-width: 750px;
    min-width: 274px;
    box-shadow: 0px 0px 10px 0px #f5f5f504;
}

.input-container-header {
    padding: 0px 12.5px;
    display: flex;
    align-items: center;
}

.filler {
    flex: 1;
}

.numeric {
    margin-left: 5px;
    font-family: monospace;
    font-size: 16px;
}

.input-container-body {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0px 12px;
}

.input-container-body-object {
    display: flex;
    flex-direction: column;
    background-color: rgb(59, 40, 46);
    flex: 1;
    min-width: 250px;
    border-radius: 12px;
}

input {
    background-color: transparent;
    border: none;
    outline: none;
    height: 100%;
    font-size: 24px;
    font-family: monospace;
    color: #f5f5ff;
    margin: 9px 15px 0px 15px;
}

.line {
    height: 2px;
    background-color: #f5f5ff80;
    margin: 0px 15px 13px 15px;
}

.options {
    position: absolute;
    top: 100%;
    width: 100%;
    margin-top: 5px;
    border-radius: 12px;
    box-shadow: 0px 0px 500px 500px #0000004b;
    background-color: rgb(59, 40, 46);
    pointer-events: none;
}

.options .chain {
    width: 100%;
    border-radius: 0px 0px 0px 0px;
    pointer-events: auto;
    z-index: 2;
    position: relative;
}

.options .chain:first-child {
    border-radius: 12px 12px 0px 0px;
}

.options .chain:last-child {
    border-radius: 0px 0px 12px 12px;
}

.options .chain:only-child {
    border-radius: 12px 12px 12px 12px;
}

</style>