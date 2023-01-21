// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/foosToPoints.sol';
import '../vars/generators.sol';

contract hasExtPoints is
hasVarGenerators
{

    function points(Foo[] calldata foos)
    external view returns (uint[] memory points)
    {
        points = new uint[](foos.length);
        for (uint i; i < points.length; i++)
            points[i] = foosToPoints(foos[i], generators, msg.sender);
    }

}