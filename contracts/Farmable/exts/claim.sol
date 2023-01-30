// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/vars/balanceOf.sol';
import '../../ERC20/ints/move.sol';
import '../vars/liquidity.sol';
import '../../Tangle/vars/minBal.sol';
import '../vars/generator.sol';
import '../ints/available.sol';

contract hasExtClaim is
hasVarBalanceOf,
hasVarGenerator,
hasVarLiquidity,
hasVarMinBal
{

    function claim(string[] calldata farmNames) external {
        for (uint i; i < farmNames.length; i++) {
            Farm storage farm = generator.farms[farmNames[i]];
            Account storage account = farm.accounts[msg.sender];
            updateFarm(generator, farm);
            move(address(this), address(liquidity), balanceOf, generator, minBal, [address(this), msg.sender], _available(generator, farm, account));
            account.S = farm.S;
            account.R = 0;
        }
    }

}