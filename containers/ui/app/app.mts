import express from 'express'
import { ethers, Wallet } from 'ethers5'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { JsonRpcProvider } from '@ethersproject/providers'
import chains from './chains.json' assert { type: "json" }
import tnglJson from './tngl.json' assert { type: "json" }

process.env.GOOGLE_APPLICATION_CREDENTIALS = './bradbrownllc-tngl-6f28aeff09d5.json'

let client = new SecretManagerServiceClient()
let name = 'projects/bradbrownllc-tngl/secrets/testnet-faucet-private-key/versions/4'
let { payload } = (await client.accessSecretVersion({ name }))[0]
let key = payload.data.toString()

let { Contract } = ethers
let { address, abi } = tnglJson


let app = express()
let port = process.env.PORT || 80
app.set('trust proxy', true);
app.get('*', async (req, res) => {
    let { path } = req 
    if (path == '/_ah/start' || path == '/_ah/stop') {
        res.status(404).end()
        return
    }
    if (req.header('X-Forwarded-Proto') == 'http') {
        res.redirect(301, `https://${req.headers.host}${path}`);
        return
    }
    if (path == '/faucet') {
        let { chain } = req.query
        let sender = req.query.address
        let rpcUrl = chains[String(chain)].rpcUrls[0]
        let provider = new JsonRpcProvider(rpcUrl)
        let wallet = new Wallet(key, provider)
        let tangle = new Contract(address, abi, wallet)
        let status = 200
        let result = await tangle.transfer(sender, 10000000000n)
        .catch((reason: any) => {
            status = 500
            return reason
        })
        res.status(status).end(JSON.stringify(result))
        return
    }
    if (path == '/') path = '/index.html'
    res.sendFile(path.slice(1), { root: '.' });
});
app.listen(port)