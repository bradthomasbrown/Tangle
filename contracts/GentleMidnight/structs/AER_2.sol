// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './AER_1.sol';
import './Proof.sol';

struct AER_2 {
    AER_1 _1;
    Proof proof;
    uint root;
    uint refund;
    uint spent;
    AER_0 new_0;
}