// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';

function max(Input[] calldata inputs) pure returns (uint work) {
    for (uint i; i < inputs.length; i++)
        if (inputs[i].work > work)
            work = inputs[i].work;
}