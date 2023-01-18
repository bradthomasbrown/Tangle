// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/ints/move.sol';

import './available.sol';
import './updateFarm.sol';
import '../structs/Foo.sol';

function _claim(
    address _this,
    mapping(address => uint) storage balanceOf,
    mapping(string => Generator) storage generators,
    Foo calldata foo,
    address msgSender
) {
    bytes32 genHash = keccak256(abi.encode(foo.generator));
    Generator storage generator = generators[foo.generator];
    Farm storage farm = generator.farms[foo.farm];
    Account storage account = farm.accounts[msgSender];
    updateFarm(generator, farm);
    uint R = _available(generator, farm, account);
    if (genHash == keccak256(abi.encode('tangle'))) move(balanceOf, _this, msg.sender, R);
    if (genHash == keccak256(abi.encode('native'))) payable(msg.sender).transfer(R);
    account.S = farm.S;
    account.R = 0;
}