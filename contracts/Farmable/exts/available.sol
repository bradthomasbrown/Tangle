// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/foosToAvails.sol';
import '../vars/generators.sol';

contract hasExtAvailable is
hasVarGenerators
{

    function available(Foo[] calldata foos)
    external view returns (uint[] memory avails)
    {
        avails = new uint[](foos.length);
        for (uint i; i < avails.length; i++)
            avails[i] = foosToAvails(foos[i], generators, msg.sender);
    }

}