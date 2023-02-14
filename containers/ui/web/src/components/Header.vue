<script lang="ts">
import { ethers } from 'ethers5'
let { providers } = ethers
let { Web3Provider } = providers
export default {
    data() {
        return {
            active: false,
            hover: false,
            focus: false,
            connected: false
        }
    },
    methods: {
        action(e: Event) {
            if (this.connected) return
            if (e.type == 'mousedown') this.active = true
            if (e.type == 'mouseup') this.active = false
            if (e.type == 'mouseleave') { this.hover = false; this.active = false }
            if (e.type == 'mouseover') this.hover = true
            if (e.type == 'keydown') this.active = true
            if (e.type == 'keyup') this.active = false
            if (e.type == 'focusin') this.focus = true
            if (e.type == 'focusout') this.focus = false
            if (e.type == 'touchstart') this.active = true
            if (e.type == 'touchend') this.active = false
        },
        async click() {
            if (!window['ethereum']) { alert('Metamask not detected!'); return }
            let provider = new Web3Provider(window['ethereum'])
            await provider.send('eth_requestAccounts', [])
            this.connected = true
            this.active = false
            this.hover = false
            this.focus = false
            window['ethereum'].on('accountsChanged', (accounts: string[]) => {
                if (!accounts.length) this.connected = false
            })
        },
        accountsChanged() {
            let ethereum = window['ethereum']
            if (!ethereum.selectedAddress) this.connected = false
        }
    },
    mounted() {
        let ethereum = window['ethereum']
        if (!ethereum) return
        if (ethereum.isConnected() && ethereum.selectedAddress)
            this.connected = true
        ethereum.on('accountsChanged', this.accountsChanged)
    }
}
</script>

<template>
    <div id="header">
        <img draggable="false" alt="tngl-logo" src="/tngl-logo.svg">
        tngl.io
        <div class="filler"></div>
        <button
            type="button"
            id="connector"
            :class="`` +
            `primary-btn` +
            `${active ? ' active': ''}` +
            `${hover || focus ? ' hover': ''}` +
            `${connected ? ' disabled': ''}` +
            ``"
            @mousedown="action"
            @mouseup="action"
            @mouseleave="action"
            @mouseover="action"
            @keydown.enter="action" 
            @keyup.enter="action"
            @focusin="action"
            @focusout="action"
            @touchstart.passive="action"
            @touchend="action"
            @click="click"
        >
            {{ connected ? 'Connected' : 'Connect Wallet' }}
        </button>
    </div>
</template>

<style scoped>

img {
    height: 100%;
}

div {
    display: flex;
    align-items: center;
    font-size: 32px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #f5f5ff;
    user-select: none;
}

#header {
    display: flex;
    gap: 10px;
    padding: 20px 20px;
    height: 50px;
}

.filler {
    flex: 1
}

#connector {
    float: right;
}

</style>