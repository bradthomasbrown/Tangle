// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/vars/balanceOf.sol';

import '../ints/claim.sol';
import '../vars/generators.sol';

contract hasExtClaim is
hasVarBalanceOf,
hasVarGenerators
{

    function claim(Foo[] calldata foos) external {
        for (uint i; i < foos.length; i++)
            _claim(address(this), balanceOf, generators, foos[i], msg.sender);
    }

}