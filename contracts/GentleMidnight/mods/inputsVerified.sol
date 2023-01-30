// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/verify.sol';
import '../structs/ADISA.sol';

contract hasModInputsVerified {

    modifier inputsVerified (
        Input[] calldata inputs,
        Proof[] calldata proofs,
        ADISA storage adisa
    ) {
        for (uint i; i < inputs.length; i++) require(verify(inputs[i], proofs[i], adisa), 'input unverified');
        _;
    }

}