// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Dir.sol';
import './AER_2.sol';
import './Work.sol';

struct Transaction {
    Dir[] dirs;
    AER_2[] a2s;
    Work[] works;
}