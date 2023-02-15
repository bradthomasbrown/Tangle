// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Request.sol';
import '../structs/Output.sol';

function sum(Request[] memory requests) pure returns (uint x) {
    for (uint i; i < requests.length; i++)
        x += requests[i].input;
}

function sum(Output[] memory outputs) pure returns (uint x) {
    for (uint i; i < outputs.length; i++)
        x += outputs[i].value;
}