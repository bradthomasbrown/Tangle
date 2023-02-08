<script setup lang="ts">
import { ref } from 'vue';
import { Web3Provider } from '@ethersproject/providers'
let active = ref(false)
let hover = ref(false)
let focus = ref(false)
let connected = ref(false)
let action = (e: Event) => {
    if (connected.value) return
    if (e.type == 'mousedown') active.value = true
    if (e.type == 'mouseup') active.value = false
    if (e.type == 'mouseleave') { hover.value = false; active.value = false }
    if (e.type == 'mouseover') hover.value = true
    if (e.type == 'keydown') active.value = true
    if (e.type == 'keyup') active.value = false
    if (e.type == 'focusin') focus.value = true
    if (e.type == 'focusout') focus.value = false
    if (e.type == 'touchstart') active.value = true
    if (e.type == 'touchend') active.value = false
}
let click = async () => {
    if (!window['ethereum']) { alert('Metamask not detected!'); return }
    let provider = new Web3Provider(window['ethereum'])
    await provider.send('eth_requestAccounts', [])
    connected.value = true
    active.value = false
    hover.value = false
    focus.value = false
    window['ethereum'].on('accountsChanged', (accounts: string[]) => {
        if (!accounts.length) connected.value = false
    })
}
</script>

<template>
    <div id="header">
        <img draggable="false" alt="tngl-logo" src="tngl-logo.svg">
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
            @touchstart="action"
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