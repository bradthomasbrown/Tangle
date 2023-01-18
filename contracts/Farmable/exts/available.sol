// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/fooToBar.sol';
import '../vars/generators.sol';

contract hasExtAvailable is
hasVarGenerators
{

    function available(Foo[] calldata foos)
    external view returns (Bar[] memory bars)
    {
        bars = new Bar[](foos.length);
        for (uint i; i < bars.length; i++)
            bars[i] = fooToBar(foos[i], generators, msg.sender);
    }

}