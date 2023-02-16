// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/updateFarm.sol';
import '../struct/Acc.sol';
import '../var/accs.sol';
import '../var/farms.sol';
contract hasExtAdjustStake is hasVarAccs, hasVarFarms {
    function adjustStake(int delta) external {
        Farm storage farm = farms['stake']; 
        Acc storage acc = accs['stake'][msg.sender]; 
        Gen storage gen = farm.gen;
        updateFarm(farm);
        acc.reward += acc.points * (farm.sigma - acc.sigma) / gen.valueScaler;
        acc.sigma = farm.sigma;
        farm.points = uint(int(farm.points) + delta);
        acc.points = uint(int(acc.points) + delta);
        if (delta < 0) liquidity.transfer(msg.sender, uint(-delta));
        else liquidity.transferFrom(msg.sender, address(this), uint(delta));
        emit AdjustStake(msg.sender, delta); }
    ERC20 public liquidity;
    event AdjustStake(address staker, int delta); }
interface ERC20 {
    function transfer(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external; }