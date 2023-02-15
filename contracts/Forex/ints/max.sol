// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Request.sol';

function max(Request[] calldata request) pure returns (uint work) {
    for (uint i; i < request.length; i++)
        if (request[i].work > work)
            work = request[i].work;
}