// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';

contract hasModInputsDistinct {

    modifier inputsDistinct(Input[] calldata inputs)
    {
        for (uint i; i < inputs.length; i++)
            for (uint j = i + 1; j < inputs.length; j++)
                require(inputs[i].id != inputs[j].id, 'indistinct inputs');
        _;
    }

}