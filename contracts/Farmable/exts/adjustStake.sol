// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/adjustPoints.sol';
import '../vars/generators.sol';
import '../vars/liquidity.sol';

contract hasExtAdjustStake is
hasVarGenerators,
hasVarLiquidity
{

    function adjustStake(int amount) external {
        Generator storage generator = generators['tangle'];
        Farm storage farm = generator.farms['stake'];
        Account storage account = farm.accounts[msg.sender];
        adjustPoints(generator, farm, account, amount);
        if (amount < 0) liquidity.transfer(msg.sender, uint(-amount));
        else liquidity.transferFrom(msg.sender, address(this), uint(amount));
    }

}