// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '@ERC20/ERC20.sol';
import '@Farmable/Farmable.sol';
import '@GentleMidnight/GentleMidnight.sol';

contract Tangle is
ERC20,
Farmable,
GentleMidnight
{}