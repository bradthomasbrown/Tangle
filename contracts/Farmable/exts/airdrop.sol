// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/events/Transfer.sol';
import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../vars/accounts.sol';
import '../vars/farms.sol';
import '../vars/liquidity.sol';
import '../events/Airdrop.sol';
import '../../Tangle/vars/minBal.sol';
import '../../Tangle/vars/airdropAmount.sol';
import '../../Tangle/vars/owner.sol';

import '../ints/adjustPoints.sol';
import '../vars/generator.sol';

contract hasExtAirdrop is
hasEventTransfer,
hasVarBalanceOf,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarLiquidity,
hasVarAirdropAmount,
hasVarMinBal,
hasVarOwner,
hasEventAirdrop
{

    function airdrop(address[] calldata recipients)
    external
    {
        for (uint i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            if (balanceOf[recipient] != 0) continue;
            adjustPoints(generator, farms['airdrop'], accounts['airdrop'][msg.sender], 1);
            move(address(this), balanceOf, generator, farms, accounts, minBal, [msg.sender, recipient], airdropAmount);
        }
        emit Airdrop(msg.sender, recipients);
    }

}