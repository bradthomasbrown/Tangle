// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../free/updateFarm.sol';
import '../var/accs.sol';
import '../var/balanceOf.sol';
import '../var/farms.sol';
import '../var/liquidityPool.sol';
contract hasExtUpdateHoldAcc is hasVarAccs, hasVarBalanceOf, hasVarFarms, 
hasVarLiquidityPool {
    function updateHoldAcc(address guy) external {
        require(guy != address(this), 'guy cannot be tangle');
        require(guy != address(liquidityPool), 'guy cannot be liquidityPool');
        Farm storage farm = farms[FarmID.HOLD];
        updateFarm(farm);
        Gen storage gen = farm.gen;
        Acc storage acc = accs[FarmID.HOLD][guy];
        acc.reward += acc.points * (farm.sigma - acc.sigma) / gen.valueScaler;
        acc.sigma = farm.sigma;
        if (balanceOf[guy] > acc.points)
            farm.points += balanceOf[guy] - acc.points;
        if (acc.points > balanceOf[guy])
            farm.points -= acc.points - balanceOf[guy];
        acc.points = balanceOf[guy]; }}