import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { ethers, Wallet } from 'ethers'
import tnglJson from '../app/tngl.json'
import chains from '../app/chains.json'
import { JsonRpcProvider } from '@ethersproject/providers'

let { Contract } = ethers
let { address, abi } = tnglJson

export default defineConfig({
    build: {
        outDir: '/ui/app' 
    },
    plugins: [
        [vue()],
        {
            name: 'configure-response-headers',
            configureServer: server => {
                server.middlewares.use((_req, res, next) => {
                    let old = res.end
                    res.end = function() {
                        if (res.headersSent) return old.apply(this, arguments)
                        let contentType = String(res.getHeader('Content-Type'))
                        if (contentType && !contentType.match('charset'))
                            res.setHeader('Content-Type', `${contentType}; charset=utf-8`)
                        return old.apply(this, arguments)
                    }
                    next()
                })
            }
        },
        {
            name: 'tngl-testnet-faucet',
            configureServer: server => {
                server.middlewares.use(async (req, res, next) => {
                    if (req.originalUrl.match('faucet')) {
                        let url = req.originalUrl
                        let queries = Object.fromEntries(
                            url.split('?')[1]
                            .split('&')
                            .map(query => query.split('='))
                        )
                        let sender = queries.address
                        let { chain } = queries
                        let rpcUrl = chains[String(chain)].rpcUrls[0]
                        let provider = new JsonRpcProvider(rpcUrl)
                        let wallet = new Wallet(process.env.testkey, provider)
                        let tangle = new Contract(address, abi, wallet)
                        res.statusCode = 200
                        let result = await tangle.transfer(sender, 10000000000n, { gasLimit: 250000 })
                        .catch((reason: any) => {
                            res.statusCode = 500
                            return reason
                        })
                        res.end(JSON.stringify(result))
                    } else next()
                })
            }
        }
    ]
})