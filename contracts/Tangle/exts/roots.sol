// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../GentleMidnight/vars/ADISA.sol';

contract hasExtRoot is
hasVarADISA
{
    function root(uint i) external view returns (bytes32)
    {
        return adisa.roots[i];
    }
}