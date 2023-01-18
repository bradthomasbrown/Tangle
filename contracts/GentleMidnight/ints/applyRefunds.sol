// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/AER_2.sol';

function applyRefunds(AER_2[] calldata a2s) {
    for (uint i; i < a2s.length; i++) 
        if (a2s[i].refund > 0)
            payable(a2s[i]._1.sender).transfer(a2s[i].refund * 19 / 20);
}