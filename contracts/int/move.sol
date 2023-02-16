// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/updateFarm.sol';
import '../var/accs.sol';
import '../var/balanceOf.sol';
import '../var/farms.sol';
import '../var/minBal.sol';
contract hasIntMove is hasVarAccs, hasVarBalanceOf, hasVarFarms, hasVarMinBal {
    function move(address from, address to, uint value) internal {
        Farm storage farm = farms['hold'];
        if (balanceOf[from] - value < minBal) value -= minBal;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        updateFarm(farms['hold']);
        if (from.code.length == 0) updateHoldAcc(from);
        else farm.points += value;
        if (to.code.length == 0) updateHoldAcc(to);
        else farm.points -= value;
        if (to == address(this)) payGens(value);
        emit Transfer(from, to, value); }
    function updateHoldAcc(address guy) internal {
        Farm storage farm = farms['hold'];
        Gen storage gen = farm.gen;
        Acc storage acc = accs['hold'][guy];
        acc.reward += acc.points * (farm.sigma - acc.sigma) / gen.valueScaler;
        acc.sigma = farm.sigma;
        acc.points = balanceOf[guy]; }
    function payGens(uint value) internal {
        string[4] memory ids = ['hold', 'airdrop', 'stake', 'mine'];
        for (uint i; i < ids.length; i++) {
            Farm storage farm = farms[ids[i]];
            Gen storage gen = farm.gen;
            gen.reward = generated(gen) / gen.valueScaler;
            gen.t2 = gen.t1;
            gen.t1 = block.timestamp;
            gen.timeScaler += gen.t1 - gen.t2;
            gen.maxValue += value / ids.length; }}
    event Transfer(address indexed from, address indexed to, uint256 value); }
