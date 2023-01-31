// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/ints/adjustPoints.sol';

function move(
    address _this,
    mapping(address => uint) storage balances,
    Generator storage generator,
    mapping(string => Farm) storage farms,
    mapping(string => mapping(address => Account)) storage accounts,
    uint minBal,
    address[2] memory path, 
    uint value
) {
    if (path[0] != address(0) && balances[path[0]] - value < minBal) value -= minBal;
    for (uint i = 0; i < 2; i++)
        if (path[i].code.length == 0 && path[i] != address(0) && path[i] != _this)
            adjustPoints(generator, farms['hold'], accounts['hold'][path[i]], (2 * int(i) - 1) * int(value));
    if (path[0] != address(0)) balances[path[0]] -= value;
    balances[path[1]] += value;
    if (path[1] == _this) adjustGenerator(generator, value);
}

