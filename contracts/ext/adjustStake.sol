// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../free/updateFarm.sol';
import '../struct/Acc.sol';
import '../var/accs.sol';
import '../var/liquidityPool.sol';
import '../var/farms.sol';
contract hasExtAdjustStake is hasVarAccs, hasVarFarms, hasVarLiquidityPool {
    function adjustStake(int delta) external {
        Farm storage farm = farms[FarmID.STAKE];
        Acc storage acc = accs[FarmID.STAKE][msg.sender];
        Gen storage gen = farm.gen;
        updateFarm(farm);
        acc.reward += acc.points * (farm.sigma - acc.sigma) / gen.valueScaler;
        acc.sigma = farm.sigma;
        farm.points = uint(int(farm.points) + delta);
        acc.points = uint(int(acc.points) + delta);
        if (delta < 0) liquidityPool.transfer(msg.sender, uint(-delta));
        else liquidityPool.transferFrom(msg.sender, address(this), uint(delta));
        emit AdjustStake(msg.sender, delta); }
    event AdjustStake(address staker, int delta); }