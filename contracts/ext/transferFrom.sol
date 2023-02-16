// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../int/move.sol';
contract hasExtTransferFrom is hasIntMove {
    function transferFrom(address from, address to, uint value) external {
        move(from, to, value); }}