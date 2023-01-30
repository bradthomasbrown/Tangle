// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/ints/adjustPoints.sol';

function move(
    address _this,
    address liquidity,
    mapping(address => uint) storage balances,
    Generator storage generator,
    uint minBal,
    address[2] memory path, 
    uint value
) {
    if (balances[path[1]] - value < minBal) value -= minBal;
    Farm storage farm = generator.farms['hold'];
    if (liquidity != address(0))
        for (uint i = 0; i < 2; i++)
            if (path[i] != liquidity && path[i] != _this && path[i] != address(0))
                adjustPoints(generator, farm, farm.accounts[path[i]], (2 * int(i) - 1) * int(value));
    balances[path[0]] -= value;
    balances[path[1]] += value;
    if (path[1] == _this) adjustGenerator(generator, value);
}

