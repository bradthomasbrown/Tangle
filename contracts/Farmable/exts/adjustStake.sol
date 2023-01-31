// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/adjustPoints.sol';
import '../vars/accounts.sol';
import '../vars/farms.sol';
import '../vars/generator.sol';
import '../vars/liquidity.sol';

contract hasExtAdjustStake is
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarLiquidity
{

    function adjustStake(int amount) external {
        adjustPoints(generator, farms['stake'], accounts['stake'][msg.sender], amount);
        if (amount < 0) liquidity.transfer(msg.sender, uint(-amount));
        else liquidity.transferFrom(msg.sender, address(this), uint(amount));
    }

}