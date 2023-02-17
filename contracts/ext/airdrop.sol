// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../free/updateFarm.sol';
import '../int/move.sol';
import '../var/accs.sol';
import '../var/airdropAmount.sol';
import '../var/farms.sol';
contract hasExtAirdrop is hasVarAirdropAmount, hasVarAccs, hasIntMove, 
hasVarFarms {
    function airdrop(address[] calldata recipients) external {
        Farm storage farm = farms[FarmID.AIRDROP];
        Gen storage gen = farm.gen;
        Acc storage acc = accs[FarmID.AIRDROP][msg.sender];
        updateFarm(farm);
        acc.reward += acc.points * (farm.sigma - acc.sigma) / gen.valueScaler;
        acc.sigma = farm.sigma;
        uint successfulAirdrops;
        for (uint i = 0; i < recipients.length; i++) {
            if (balanceOf[recipients[i]] != 0) continue;
            move(msg.sender, recipients[i], airdropAmount);
            successfulAirdrops++; }
        farm.points += successfulAirdrops;
        acc.points += successfulAirdrops;
        emit Airdrop(msg.sender, recipients); }
    event Airdrop(address airdropper, address[] recipients); }