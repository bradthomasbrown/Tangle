#!/usr/bin/node

import { execSync } from 'child_process'
import { SS } from './HelpfulCandlewax/index.mjs'

function sendEth() {
    if (this.request.url == '/shutdown') return
    let address = this.request.url.substring(1)
    // web3.personal.unlockAccount(web3.personal.listAccounts[0],"<password>", 15000)
    execSync(`geth --exec 'web3.personal.unlockAccount(eth.coinbase, "", 86400)' attach http://localhost:8545`)
    let result = execSync(`geth --exec 'eth.sendTransaction({ from: eth.coinbase, to: "${address}", value: web3.toWei(1, "ether") })' attach http://localhost:8545`)
    this.data = result.toString().match(/"(.*)"/)[1]
}

new SS({ func: sendEth, verbose: true})