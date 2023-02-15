// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

contract hasModSubexInputsEqValue
{
    modifier subexInputsEqValue(
        Subex[] calldata subexs, 
        uint value
    ) {
        uint sum;
        for (uint i; i < subexs.length; i++)
            sum += subexs.input;
        require(sum == value, 'subex inputs != value');
        _;
    }
}