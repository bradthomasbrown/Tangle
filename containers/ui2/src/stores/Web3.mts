import { writable, get, type Writable } from 'svelte/store'
import { browser } from '$app/environment'
import { BrowserProvider, Contract, JsonRpcApiProvider, JsonRpcSigner } from 'ethers6'
import { abi, address } from '../../../../json/tngl.json'
import EventEmitter from 'events';

interface MetamaskProvider extends EventEmitter {
    request(request: {
        method: string
        params?: Array<any> | Record<string, any>
    }): Promise<any>
    chainId: string
    selectedAddress: string
}

interface Web3Tx {
    status?: string
    data?: string
}

interface Web3 {
    ethereum?: MetamaskProvider
    provider?: BrowserProvider
    chainId?: string
    selectedAddress?: string
    block?: number
    signer?: JsonRpcSigner
    nonce?: bigint
    tangle?: Contract
    nativeBalance?: bigint | Error
    tangleBalance?: bigint | Error
}

let Web3: Writable<Web3> = writable({})
let pollId: NodeJS.Timer

if (browser && window.ethereum) {
    let ethereum: MetamaskProvider = window.ethereum
    Web3 = writable({})
    ethereum.on('chainChanged', onChainChanged)
    ethereum.on('accountsChanged', onAccountsChanged)
    init()

    async function init() {
        console.log('init')
        let tmp = { ethereum: window.ethereum }
        updateChainId(tmp)
        updateSelectedAddress(tmp)
        updateProvider(tmp)
        await Promise.all([
            updateBlock(tmp),
            updateNativeBalance(tmp),
            updateSigner(tmp)
            .then(() => updateTangle(tmp))
            .then(() => updateTangleBalance(tmp))
        ])
        pollId = setTimeout(poll, 1000)
        Object.assign(tmp, { nonce: 0n })
        Web3.set(tmp)
    }

    async function onChainChanged() {
        console.log('onChainChanged')
        let { ethereum, nonce, selectedAddress } = get(Web3)
        let tmp = { ethereum, selectedAddress }
        updateChainId(tmp)
        updateProvider(tmp)
        await Promise.all([
            updateBlock(tmp),
            updateNativeBalance(tmp),
            updateSigner(tmp)
            .then(() => updateTangle(tmp))
            .then(() => updateTangleBalance(tmp))
        ])
        Object.assign(tmp, { nonce: ++nonce })
        Web3.set(tmp)
    }
    
    async function onAccountsChanged() {
        console.log('onAccountsChanged')
        let { ethereum, nonce, chainId } = get(Web3)
        let tmp = { ethereum, chainId }
        updateSelectedAddress(tmp)
        updateProvider(tmp)
        await Promise.all([
            updateBlock(tmp),
            updateNativeBalance(tmp),
            updateSigner(tmp)
            .then(() => updateTangle(tmp))
            .then(() => updateTangleBalance(tmp))
        ])
        Object.assign(tmp, { nonce: ++nonce })
        Web3.set(tmp)
    }
    
    async function poll() {
        console.log('poll')
        let { ethereum, nonce, chainId, selectedAddress, provider, block,
            tangle } = get(Web3)
        let tmp: Web3 = { ethereum, chainId, selectedAddress, provider,
            tangle }
        let n = await provider?.getBlockNumber()
        if (n === block || n === undefined) {
            pollId = setTimeout(poll, 1000);
            return
        }
        Object.assign(tmp, { block: n })
        await Promise.all([
            updateNativeBalance(tmp),
            updateTangleBalance(tmp)
        ])
        if (tmp.tangleBalance instanceof Error
        || tmp.nativeBalance instanceof Error) {
            pollId = setTimeout(poll, 1000);
            return
        }
        if (nonce != get(Web3).nonce) {
            pollId = setTimeout(poll, 1000);
            return
        }
        pollId = setTimeout(poll, 1000)
        Object.assign(tmp, { nonce: ++nonce })
        Web3.set(tmp)
    }

    function updateChainId(tmp: Web3) {
        console.log('updateChainId')
        Object.assign(tmp, { chainId: ethereum.chainId })
    }

    function updateSelectedAddress(tmp: Web3) {
        console.log('updateSelectedAddress')
        Object.assign(tmp, { selectedAddress: ethereum.selectedAddress })
    }

    function updateProvider(tmp: Web3) {
        console.log('updateProvider')
        Object.assign(tmp, { provider: new BrowserProvider(ethereum, 'any') })
    }

    async function updateBlock(tmp: Web3) {
        console.log('updateBlock')
        Object.assign(tmp, { block: await tmp.provider.getBlockNumber() })
    }

    async function updateNativeBalance(tmp: Web3) {
        console.log('updateNativeBalance')
        if (tmp.selectedAddress) Object.assign(tmp, { nativeBalance:
            await tmp.provider.getBalance(tmp.selectedAddress)
                .catch(() => { return new Error() })})
    }

    async function updateSigner(tmp: Web3) {
        console.log('updateSigner')
        Object.assign(tmp, { signer: tmp.selectedAddress
            ? await tmp.provider.getSigner() : undefined })
    }

    async function updateTangle(tmp: Web3) {
        console.log('updateTangle')
        let tangle = new Contract(address, abi, tmp.signer ?? tmp.provider)
        if (await tangle.getDeployedCode()) Object.assign(tmp, { tangle })
    }

    async function updateTangleBalance(tmp: Web3) {
        console.log('updateTangleBalance')
        if (tmp.selectedAddress) Object.assign(tmp, { tangleBalance:
            await tmp.tangle?.balanceOf(tmp.selectedAddress,
                { blockTag: 'latest'}).catch(() => { return new Error() })})
    }

}

function getSigner() {
    get(Web3).provider.getSigner()
}

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept()
    // @ts-ignore
    import.meta.hot.dispose(() => {
        clearInterval(pollId)
        window.ethereum.removeAllListeners()
    })
}

export { Web3, getSigner }