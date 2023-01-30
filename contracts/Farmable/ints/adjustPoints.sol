// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './updateFarm.sol';
import './updateAccount.sol';

function adjustPoints(
    Generator storage generator,
    Farm storage farm,
    Account storage account,
    int amount
) {
    updateFarm(generator, farm);
    updateAccount(generator, farm, account);
    farm.P = uint(int(farm.P) + amount);
    account.P = uint(int(account.P) + amount);
}

