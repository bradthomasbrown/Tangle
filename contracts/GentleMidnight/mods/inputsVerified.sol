// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/verifyInput.sol';
import '../structs/ZippySoup.sol';

contract hasModInputsVerified {

    modifier inputsVerified (
        Stream[] calldata streams,
        InputProof[] calldata proofs,
        ZippySoup storage zs
    ) {
        uint i;
        for (; streams[i].chain != block.chainid; i++);
        Input[] calldata inputs = streams[i].inputs;
        for (i = 0; i < inputs.length; i++) require(verifyInput(inputs[i], proofs[i], zs), 'input unverified');
        _;
    }

}