// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/getMaxDVT.sol';
import '../ints/score.sol';
import '../ints/verify.sol';
import '../structs/Work.sol';

contract hasModAuditWorks {

    modifier auditWorks (
        AER_2[] calldata a2s,
        Work[] calldata works
    ) {
        uint maxDVT = getMaxDVT(a2s);
        uint worksScore;
        for (uint i; i < works.length; i++) {
            Work calldata work = works[i];
            worksScore += score(keccak256(abi.encode(work)));
            require(verify(keccak256(i == 0 ? abi.encode(a2s) : abi.encode(works[i - 1])), work.proof, work.root), 
                'workchain broken');
        }
        require(worksScore >= maxDVT,
            'work insufficient');
        _;
    }

}