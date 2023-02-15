// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Request.sol';

contract hasModRequestsDistinct {

    modifier requestsDistinct(Request[] calldata requests)
    {
        for (uint i; i < requests.length; i++)
            for (uint j = i + 1; j < requests.length; j++)
                require(requests[i].id != requests[j].id, 'indistinct inputs');
        _;
    }

}