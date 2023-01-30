// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/events/Transfer.sol';
import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../../Farmable/vars/liquidity.sol';
import '../../Tangle/vars/minBal.sol';
import '../../Tangle/vars/airdropAmount.sol';

import '../ints/adjustPoints.sol';
import '../vars/generator.sol';

contract hasExtAirdrop is
hasEventTransfer,
hasVarBalanceOf,
hasVarGenerator,
hasVarLiquidity,
hasVarMinBal,
hasVarAirdropAmount
{

    function airdrop(address[] calldata recipients)
    external
    {
        Farm storage farm = generator.farms['airdrop'];
        Account storage account = farm.accounts[msg.sender];
        for (uint i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            if (balanceOf[recipient] != 0) continue;
            adjustPoints(generator, farm, account, 1);
            move(address(this), address(liquidity), balanceOf, generator, minBal, [msg.sender, recipient], airdropAmount);
        }
    }

}