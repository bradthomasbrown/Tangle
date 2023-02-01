import { Cluster } from '../../classes/index.mjs'
import { AddressZero } from '@ethersproject/constants'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
console.log('awaiting cluster.deployed')
await cluster.deployed
console.log('cluster.deployed')
let chain = cluster.chains[0]
let { tangle } = chain.contracts;

// ERC20 inits
assert.equal(await tangle.name(), 'Tangle')
assert.equal(await tangle.symbol(), 'TNGL')
assert.equal((await tangle.decimals()).toString(), '9')
assert.equal((await tangle.totalSupply()).toString(), '1000000000000000000')

// generator inits
assert.equal((await tangle.generator()).M.toString(), '900000000000000000')
assert.equal((await tangle.generator()).C.toString(), '14016000')
assert.equal((await tangle.generator()).R.toString(), '0')
assert.equal((await tangle.generator()).Tc.toString() == (await tangle.generator()).Tp.toString(), true)
assert.equal((await tangle.generator()).Tc.toString() != '0', true)
assert.equal((await tangle.generator()).D.toString(), '100')
assert.equal((await tangle.generator()).S.toString(), '100000000000000000000000000000000')

// Tangle inits
assert.equal(await tangle.owner(), chain.wallet.address)
assert.equal((await tangle.minBal()).toString(), '1')
assert.equal((await tangle.airdropAmount()).toString(), '1000000000')

// hold farm init
assert.equal((await tangle.farms('hold')).S.toString(), '0')
assert.equal((await tangle.farms('hold')).P.toString(), '100000000000000000')
assert.equal((await tangle.farms('hold')).N.toString(), '4')
assert.equal((await tangle.farms('hold')).R.toString(), '0')

// airdrop farm init
assert.equal((await tangle.farms('airdrop')).S.toString(), '0')
assert.equal((await tangle.farms('airdrop')).P.toString(), '0')
assert.equal((await tangle.farms('airdrop')).N.toString(), '10')
assert.equal((await tangle.farms('airdrop')).R.toString(), '0')

// stake farm init
assert.equal((await tangle.farms('stake')).S.toString(), '0')
assert.equal((await tangle.farms('stake')).P.toString(), '0')
assert.equal((await tangle.farms('stake')).N.toString(), '32')
assert.equal((await tangle.farms('stake')).R.toString(), '0')

// GentleMidnight farm init
assert.equal((await tangle.farms('GentleMidnight')).S.toString(), '0')
assert.equal((await tangle.farms('GentleMidnight')).P.toString(), '0')
assert.equal((await tangle.farms('GentleMidnight')).N.toString(), '52')
assert.equal((await tangle.farms('GentleMidnight')).R.toString(), '0')

// chain.wallet.address caller check
assert.equal((await tangle.balanceOf(chain.wallet.address)).toString(), '100000000000000000')
assert.equal((await tangle.accounts('hold', chain.wallet.address)).R.toString(), '0')
assert.equal((await tangle.accounts('hold', chain.wallet.address)).P.toString(), '100000000000000000')
assert.equal((await tangle.accounts('hold', chain.wallet.address)).S.toString(), '0')

// tangle check
assert.equal((await tangle.balanceOf(tangle.address)).toString(), '900000000000000000')
assert.equal((await tangle.accounts('hold', tangle.address)).R.toString(), '0')
assert.equal((await tangle.accounts('hold', tangle.address)).P.toString(), '0')
assert.equal((await tangle.accounts('hold', tangle.address)).S.toString(), '0')

// AddressZero check
assert.equal((await tangle.balanceOf(AddressZero)).toString(), '0')
assert.equal((await tangle.accounts('hold', tangle.address)).R.toString(), '0')
assert.equal((await tangle.accounts('hold', tangle.address)).P.toString(), '0')
assert.equal((await tangle.accounts('hold', tangle.address)).S.toString(), '0')

// listen for Deploy event
// await new Promise(resolve => tangle.once('Deploy', () => { console.log('Deploy event'); resolve(null) }))

cluster.kill()