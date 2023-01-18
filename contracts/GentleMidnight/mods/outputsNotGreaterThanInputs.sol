// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/AER_2.sol';
import '../structs/Dir.sol';

contract hasModOutputsNotGreaterThanInputs {

    modifier outputsNotGreaterThanInputs(
        AER_2[] calldata a2s,
        Dir[] calldata dirs
    ) {
        uint outputs;
        uint inputs;
        uint spent;
        uint value;
        for (uint i; i < a2s.length; i++) {
            inputs += a2s[i]._1.value;
            outputs += a2s[i].refund;
            spent += a2s[i].spent;
        }
        for (uint i; i < dirs.length; i++) {
            outputs += dirs[i].value;
            value += dirs[i].value;
        }
        require(outputs <= inputs,
            'outputs greater than inputs');
        require(value == spent,
            'spent != dirs.value');
        _;
    }

}