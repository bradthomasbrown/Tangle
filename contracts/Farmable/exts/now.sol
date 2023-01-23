// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

contract hasExtNow
{

    function _now() view external returns (uint) {
        return block.timestamp;
    }

}