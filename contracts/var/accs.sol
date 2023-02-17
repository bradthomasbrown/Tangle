// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../struct/Acc.sol';
contract hasVarAccs {
    mapping(FarmID => mapping(address => Acc)) public accs; }