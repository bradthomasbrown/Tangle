// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../vars/generator.sol';

contract hasExtPoints is
hasVarGenerator
{

    function points(string[] calldata farmNames)
    external view returns (uint[] memory foo)
    {
        foo = new uint[](farmNames.length);
        for (uint i; i < farmNames.length; i++) {
            Farm storage farm = generator.farms[farmNames[i]];
            foo[i] = farm.accounts[msg.sender].P;
        }
    }

}