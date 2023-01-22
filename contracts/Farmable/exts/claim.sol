// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/vars/balanceOf.sol';

import '../ints/claim.sol';
import '../vars/generator.sol';

contract hasExtClaim is
hasVarBalanceOf,
hasVarGenerator
{

    function claim(string[] calldata farmNames) external {
        for (uint i; i < farmNames.length; i++) {
            Farm storage farm = generator.farms[farmNames[i]];
            _claim(address(this), balanceOf, generator, farm, farm.accounts[msg.sender]);
        }
    }

}