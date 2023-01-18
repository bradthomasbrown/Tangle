// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/AER_0.sol';

contract hasModReqChainsOrderedNoDuplicates {

    modifier reqChainsOrderedNoDuplicates(AER_0 calldata a0) {
        for (uint i = 1; i < a0.reqs.length; i++)
            require(a0.reqs[i].chain > a0.reqs[i - 1].chain, 
                'unordered or duplicate chain');
        _;
    }

}