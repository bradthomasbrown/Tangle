<script lang="ts">
import IO from './IO.vue'
import { BigNumber, ethers } from 'ethers5'
import chains from '@/json/chains.json' assert { type: "json" }
import tnglJson from '@/json/tngl.json' assert { type: "json" }

let { providers, Contract } = ethers
let { Web3Provider } =  providers

export default {
    components: { IO },
    data() {
        return {
            tangle: undefined,
            selected: [undefined, undefined],
            chains: chains,
            input: undefined,
            outputs: [undefined],
            balance: undefined,
            enoughTangle: false,
            faucetWait: false
        }
    },
    methods: {
        addActive(e: Event) {
            e.target['classList'].add('active')
        },
        removeActive(e: Event) {
            e.target['classList'].remove('active')
        },
        async swap() {
            let work = 1000000000
            let gas = 1000000000
            let input = this.input
            let value = input
            let subreqs = []
            for (let i = 0; i < this.selected.slice(1).length; i++) {
                let dest = this.selected.slice(1)[i]
                let output = this.outputs[i]
                subreqs.push({ gas, work, dest, input, output })
            }
            await this.tangle.trade(subreqs, { value })
        },
        async update() {
            let ethereum = window['ethereum']
            if (!ethereum) return
            if (!ethereum.selectedAddress) {
                this.tangle = undefined
                return
            }
            let { address, abi, bytecode } = tnglJson
            let provider = new Web3Provider(ethereum);
            let signer = provider.getSigner()
            if (await provider.getCode(address) == bytecode) {
                this.tangle = new Contract(address, abi, signer)
                let balance = await this.tangle.balanceOf(ethereum.selectedAddress)
                this.enoughTangle = balance.gte(BigNumber.from('1000000000'))
            }
            else this.tangle = undefined
            this.updateBalance()
        },
        async selectedChange(e: { i: number, selected: string }) {
            let ethereum = window['ethereum']
            if (!ethereum) return
            let { i, selected } = e
            let index = this.selected.indexOf(selected)
            if (i == 0 || (index != -1 && index == 0)) {
                let selected2: any
                if (index != -1 && index == 0) selected2 = this.selected[i]
                else selected2 = selected
                let result = await ethereum.request({ 
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: selected2 }]
                })
                .catch((reason: any) => {
                    let { code } = reason
                    return code
                })
                if (result == 4001) return
                if (result == 4902 || result == -32603) {
                    let chainId = selected2
                    let { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = chains[selected2]
                    result = await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{ chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls }]
                    }).catch((reason: any) => {
                        let { code } = reason
                        return code
                    })
                }
                if (result == 4001) return
            }
            if (index != -1)
                this.selected[index] = this.selected[i]
            this.selected[i] = selected
        },
        chainChanged() {
            let ethereum = window['ethereum']
            if (!ethereum) return
            this.selectedChange({ i: 0, selected: ethereum.chainId })
            this.update()
        },
        async updateBalance() {
            let ethereum = window['ethereum']
            if (!ethereum || !ethereum.selectedAddress) return
            let provider = new Web3Provider(ethereum)
            this.balance = await provider.getBalance(ethereum.selectedAddress)
        },
        async getTngl() { 
            this.faucetWait = true
            let ethereum = window['ethereum']
            let response = await fetch(`${window.location.href.replace(/\?.*/, '')}faucet?address=${ethereum.selectedAddress}&chain=${ethereum.chainId}`)
            let json = await response.json()
            let { error } = json
            if (error) {
                this.faucetWait = false
                alert(JSON.stringify(error))
            }
            else {
                let { hash } = json
                let provider = new Web3Provider(ethereum)
                await provider.waitForTransaction(hash)
                this.faucetWait = false
                this.update()
            }
        }
    },
    mounted() {
        let ethereum = window['ethereum']
        if (!ethereum) return
        let provider = new Web3Provider(ethereum)
        provider.on('block', this.updateBalance)
        this.updateBalance()
        ethereum.on('chainChanged', this.chainChanged)
        ethereum.on('accountsChanged', this.update)
        this.update()
    }
}
</script>

<template>
    <div id="body">
        <button class="primary-btn"
            v-if="enoughTangle"
            @mousedown.stop="addActive"
            @keydown.enter.stop="addActive"
            @keydown.space.stop="addActive"
            @touchstart.passive="addActive"
            @mouseup.stop="removeActive"
            @mouseleave.stop="removeActive"
            @keyup.enter.stop="removeActive"
            @keyup.space.stop="removeActive"
            @click="swap"
            :class="!tangle || input === undefined || outputs.includes(undefined) || balance < input ? 'disabled' : ''"
        >
            Swap
        </button>
        <button class="primary-btn"
            v-if="!enoughTangle && !faucetWait"
            @mousedown.stop="addActive"
            @keydown.enter.stop="addActive"
            @keydown.space.stop="addActive"
            @touchstart.passive="addActive"
            @mouseup.stop="removeActive"
            @mouseleave.stop="removeActive"
            @keyup.enter.stop="removeActive"
            @keyup.space.stop="removeActive"
            @click="getTngl"
            :class="!tangle ? 'disabled' : ''"
        >
            Get TNGL
        </button>
        <button class="primary-btn"
            v-if="faucetWait"
            :class="'disabled'"
        >
            confirming...
        </button>
        <IO
            v-for="i of Array(outputs.length).fill(0).map((_e, i) => 1 - i)"
            :type="'to'"
            :i="i"
            :outputs="outputs"
            @outputChange="e => outputs[e.i] = e.n"
            :selected="selected"
            @selectedChange="selectedChange"
        />
        <IO
            :type="'from'"
            :i="0"
            :balance="balance"
            :input="input"
            @inputChange="value => input = value"
            :selected="selected"
            @selectedChange="selectedChange"
        />
    </div>
</template>

<style scoped>

#body {
    padding: 50px 31px;
    display: flex;
    align-items: center;
    flex-direction: column-reverse;
    gap: 25px;
}

#switch-container {
    display: flex;
    justify-content: center;
    margin: 5px 0px;
}

#switch {
    outline: none;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

#swap-container {
    margin-top: 20px;
}

</style>