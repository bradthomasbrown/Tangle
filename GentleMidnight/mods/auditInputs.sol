// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/verify.sol';
import '../structs/AER_2.sol';
import '../structs/ZippySoup.sol';

contract hasModAuditInputs {

    modifier auditInputs (
        AER_2[] calldata a2s,
        mapping(uint => uint) storage chunks,
        ZippySoup storage zs
    ) {
        for (uint i; i < a2s.length; i++) {
            AER_2 calldata a2 = a2s[i];
            require(verify(keccak256(abi.encode(a2._1)), a2.proof, zs.roots[a2.root]),
                'input unverified');
            require(chunks[a2._1.id / 256] & 1 << a2._1.id % 256 == 0,
                'input executed');
            require(a2.refund + a2.spent <= a2._1.value,
                'spent and/or refund excess');
            Req[] calldata oldReqs = a2._1._0.reqs;
            Req[] calldata newReqs = a2.new_0.reqs;
            for ((uint j, uint k) = (0, 0); j < newReqs.length; (j++, k++)) {
                if (j > 0)
                    require(newReqs[j].chain > newReqs[j - 1].chain,
                        'duplicate or unordered chain');
                for (; k < oldReqs.length; k++)
                    if (newReqs[j].chain == oldReqs[k].chain)
                        break;
                require(k < oldReqs.length, 
                    'extraneous chain');
                require(newReqs[j].value <= oldReqs[k].value,
                    'extraneous value');
            }
        }
        _;
    }

}