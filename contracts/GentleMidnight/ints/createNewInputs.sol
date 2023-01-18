// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './insert.sol';
import '../structs/AER_2.sol';

function createNewInputs(
    AER_2[] calldata a2s, 
    ZippySoup storage zs
) {
    for (uint i; i < a2s.length; i++)
        if (a2s[i].refund + a2s[i].spent < a2s[i]._1.value)
            insert(zs, a2s[i].new_0, a2s[i]._1.sender, a2s[i]._1.value - a2s[i].refund - a2s[i].spent);
}