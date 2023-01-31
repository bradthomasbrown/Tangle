// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/vars/balanceOf.sol';
import '../../ERC20/ints/move.sol';
import '../vars/liquidity.sol';
import '../../Tangle/vars/minBal.sol';
import '../../Tangle/vars/owner.sol';
import '../vars/accounts.sol';
import '../vars/farms.sol';
import '../vars/generator.sol';
import '../ints/available.sol';

contract hasExtClaim is
hasVarBalanceOf,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarLiquidity,
hasVarMinBal,
hasVarOwner
{

    function claim(string[] calldata farmNames) external {
        for (uint i; i < farmNames.length; i++) {
            Account storage account = accounts[farmNames[i]][msg.sender];
            Farm storage farm = farms[farmNames[i]];
            updateFarm(generator, farm);
            uint available = _available(generator, farm, account);
            move(address(this), balanceOf, generator, farms, accounts, minBal, [address(this), msg.sender], available);
            account.S = farm.S;
            account.R = 0;
        }
    }

}