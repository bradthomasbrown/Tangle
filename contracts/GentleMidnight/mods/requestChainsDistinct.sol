// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Request.sol';

contract requestChainsDistinct {

    modifier hasModRequestChainsDistinct(Request[] calldata requests) {
        for (uint i = 1; i < requests.length; i++)
            require(requests[i].chain > requests[i - 1].chain, 
                'request chains possibly not distinct');
        _;
    }

}