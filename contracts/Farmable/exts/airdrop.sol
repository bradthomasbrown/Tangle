// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';

import '../ints/adjustPoints.sol';
import '../mods/recipientZeroBalance.sol';
import '../vars/generators.sol';

contract hasExtAirdrop is
hasModRecipientZeroBalance,
hasVarGenerators
{

    function airdrop(address recipient)
    external
    recipientZeroBalance(recipient)
    {
        Generator storage generator = generators['tangle'];
        Farm storage farm = generator.farms['airdrop'];
        Account storage account = farm.accounts[msg.sender];
        adjustPoints(generator, farm, account, 1);
        move(balanceOf, msg.sender, recipient, 1e9);
    }

}