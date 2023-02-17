// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../var/balanceOf.sol';
import '../var/genPayment.sol';
import '../var/minBal.sol';
contract hasIntMove is hasVarBalanceOf, hasVarGenPayment, hasVarMinBal {
    function move(address from, address to, uint value) internal {
        if (from != address(0)) {
            if (balanceOf[from] - value < minBal) value -= minBal;
            balanceOf[from] -= value; }
        balanceOf[to] += value;
        if (to == address(this)) genPayment += value;
        emit Transfer(from, to, value); }
    event Transfer(address indexed from, address indexed to, uint256 value); }
