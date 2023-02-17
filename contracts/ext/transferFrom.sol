// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../int/move.sol';
import '../var/allowance.sol';
contract hasExtTransferFrom is hasVarAllowance, hasIntMove {
    function transferFrom(address from, address to, uint value) external {
        if (balanceOf[from] - value < minBal) value -= minBal;
        allowance[from][msg.sender] -= value;
        move(from, to, value); }}