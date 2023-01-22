// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/events/Transfer.sol';
import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';

import '../ints/adjustPoints.sol';
import '../vars/generator.sol';

contract hasExtAirdrop is
hasEventTransfer,
hasVarBalanceOf,
hasVarGenerator
{

    function airdrop(address[] calldata recipients)
    external
    {
        Farm storage farm = generator.farms['airdrop'];
        Account storage account = farm.accounts[msg.sender];
        uint count;
        for (uint i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            if (balanceOf[recipient] != 0) continue;
            count++;
            balanceOf[recipient] += 1e9;
            emit Transfer(msg.sender, recipient, 1e9);
        }
        adjustPoints(generator, farm, account, int(count));
        balanceOf[msg.sender] -= 1e9 * count;
    }

}