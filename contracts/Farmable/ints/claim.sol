// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/ints/move.sol';

import './available.sol';
import './updateFarm.sol';

function _claim(
    address _this,
    mapping(address => uint) storage balanceOf,
    Generator storage generator,
    Farm storage farm,
    Account storage account
) {
    updateFarm(generator, farm);
    uint R = _available(generator, farm, account);
    move(balanceOf, _this, msg.sender, R);
    account.S = farm.S;
    account.R = 0;
}