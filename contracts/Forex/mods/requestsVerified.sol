// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/verify.sol';
import '../structs/ADISA.sol';

contract hasModRequestsVerified {

    modifier requestsVerified (
        Request[] calldata requests,
        Proof[] calldata proofs,
        ADISA storage adisa
    ) {
        for (uint i; i < requests.length; i++)
            require(verify(requests[i], proofs[i], adisa), 'input unverified');
        _;
    }

}