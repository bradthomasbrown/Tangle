// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Account.sol';
import '../structs/Farm.sol';
import '../structs/Generator.sol';

function updateAccount(
    Generator storage generator,
    Farm storage farm,
    Account storage account    
) {
    account.R += account.P * (farm.S - account.S) / generator.S;
    account.S = farm.S;
}