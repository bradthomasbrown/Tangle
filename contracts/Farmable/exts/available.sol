// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/available.sol';
import '../vars/accounts.sol';
import '../vars/farms.sol';
import '../vars/generator.sol';

contract hasExtAvailable is
hasVarAccounts,
hasVarFarms,
hasVarGenerator
{

    function available(string[] calldata farmNames)
    external view returns (uint[] memory foo, uint _now)
    {
        _now = block.timestamp;
        foo = new uint[](farmNames.length);
        for (uint i; i < foo.length; i++) 
            foo[i] = _available(generator, farms[farmNames[i]], accounts[farmNames[i]][msg.sender]);
    }

}