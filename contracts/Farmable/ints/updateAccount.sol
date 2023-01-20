// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Farm.sol';

function updateAccount(
    Farm storage farm,
    Account storage account    
) {
    account.R += account.P * (farm.S - account.S) / 1e50;
    account.S = farm.S;
}