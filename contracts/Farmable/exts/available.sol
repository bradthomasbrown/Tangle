// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/available.sol';
import '../vars/generator.sol';

contract hasExtAvailable is
hasVarGenerator
{

    function available(string[] calldata farmNames)
    external view returns (uint[] memory foo)
    {
        foo = new uint[](farmNames.length);
        for (uint i; i < foo.length; i++) {
            Farm storage farm = generator.farms[farmNames[i]];
            foo[i] = _available(generator, farm, farm.accounts[msg.sender]);
        }
            
    }

}