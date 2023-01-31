import { Cluster } from '../../classes/index.mjs'
import { AddressZero } from '@ethersproject/constants'
import assert from 'node:assert/strict'

let cluster = new Cluster(1)
await cluster.deployed
let chain = cluster.chains[0]
let Tangle = chain.contracts['tangle'];

// ERC20 inits
assert.equal(await Tangle.name(), 'Tangle')
assert.equal(await Tangle.symbol(), 'TNGL')
assert.equal((await Tangle.decimals()).toString(), '9')
assert.equal((await Tangle.totalSupply()).toString(), '1000000000000000000')

// generator inits
assert.equal((await Tangle.generator()).M.toString(), '900000000000000000')
assert.equal((await Tangle.generator()).C.toString(), '14016000')
assert.equal((await Tangle.generator()).R.toString(), '0')
assert.equal((await Tangle.generator()).Tc.toString() == (await Tangle.generator()).Tp.toString(), true)
assert.equal((await Tangle.generator()).Tc.toString() != '0', true)
assert.equal((await Tangle.generator()).D.toString(), '100')
assert.equal((await Tangle.generator()).S.toString(), '100000000000000000000000000000000')

// Tangle inits
assert.equal(await Tangle.owner(), chain.wallet.address)
assert.equal((await Tangle.minBal()).toString(), '1')
assert.equal((await Tangle.airdropAmount()).toString(), '1000000000')

// hold farm init
assert.equal((await Tangle.farms('hold')).S.toString(), '0')
assert.equal((await Tangle.farms('hold')).P.toString(), '100000000000000000')
assert.equal((await Tangle.farms('hold')).N.toString(), '4')
assert.equal((await Tangle.farms('hold')).R.toString(), '0')

// airdrop farm init
assert.equal((await Tangle.farms('airdrop')).S.toString(), '0')
assert.equal((await Tangle.farms('airdrop')).P.toString(), '0')
assert.equal((await Tangle.farms('airdrop')).N.toString(), '10')
assert.equal((await Tangle.farms('airdrop')).R.toString(), '0')

// stake farm init
assert.equal((await Tangle.farms('stake')).S.toString(), '0')
assert.equal((await Tangle.farms('stake')).P.toString(), '0')
assert.equal((await Tangle.farms('stake')).N.toString(), '32')
assert.equal((await Tangle.farms('stake')).R.toString(), '0')

// GentleMidnight farm init
assert.equal((await Tangle.farms('GentleMidnight')).S.toString(), '0')
assert.equal((await Tangle.farms('GentleMidnight')).P.toString(), '0')
assert.equal((await Tangle.farms('GentleMidnight')).N.toString(), '52')
assert.equal((await Tangle.farms('GentleMidnight')).R.toString(), '0')

// chain.wallet.address caller check
assert.equal((await Tangle.balanceOf(chain.wallet.address)).toString(), '100000000000000000')
assert.equal((await Tangle.accounts('hold', chain.wallet.address)).R.toString(), '0')
assert.equal((await Tangle.accounts('hold', chain.wallet.address)).P.toString(), '100000000000000000')
assert.equal((await Tangle.accounts('hold', chain.wallet.address)).S.toString(), '0')

// tangle check
assert.equal((await Tangle.balanceOf(Tangle.address)).toString(), '900000000000000000')
assert.equal((await Tangle.accounts('hold', Tangle.address)).R.toString(), '0')
assert.equal((await Tangle.accounts('hold', Tangle.address)).P.toString(), '0')
assert.equal((await Tangle.accounts('hold', Tangle.address)).S.toString(), '0')

// AddressZero check
assert.equal((await Tangle.balanceOf(AddressZero)).toString(), '0')
assert.equal((await Tangle.accounts('hold', Tangle.address)).R.toString(), '0')
assert.equal((await Tangle.accounts('hold', Tangle.address)).P.toString(), '0')
assert.equal((await Tangle.accounts('hold', Tangle.address)).S.toString(), '0')

cluster.kill()