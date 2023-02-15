// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Request.sol';

function markRequests(
    Request[] calldata requests,
    mapping(uint => uint) storage chunks
) {
    for (uint i; i < requests.length; i++)
        chunks[requests[i].id / 256] |= 1 << requests[i].id % 256;
}