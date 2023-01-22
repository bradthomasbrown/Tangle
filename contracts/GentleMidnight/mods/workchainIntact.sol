// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/verify.sol';
import '../structs/Proof.sol';
import '../structs/Stream.sol';
import '../structs/Work.sol';

contract hasModWorkchainIntact {

    modifier workchainIntact (
        Work[] calldata works, 
        Stream[] calldata streams, 
        Proof[] calldata proofs
    ) {
        for (uint i; i < works.length; i++) {
            Work calldata work = works[i];
            require(verify(keccak256(i == 0 ? abi.encode(streams) : abi.encode(works[i - 1])), proofs[i], work.root), 'workchain broken');
        }
        _;
    }

}