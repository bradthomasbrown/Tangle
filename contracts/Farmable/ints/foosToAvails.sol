// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './available.sol';
import '../structs/Foo.sol';
import '../structs/Generator.sol';


function foosToAvails(
    Foo calldata foo, 
    mapping(string => Generator) storage generators,
    address msgSender
) view returns (uint) {
    Generator storage generator = generators[foo.generator];
    Farm storage farm = generator.farms[foo.farm];
    Account storage account = farm.accounts[msgSender];
    return _available(generator, farm, account);
}