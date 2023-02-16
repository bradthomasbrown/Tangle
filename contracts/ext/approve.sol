// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
contract hasExtApprove {
    function approve(address spender, uint value) external {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value); }
    mapping(address => mapping(address => uint)) public allowance;
    event Approval(
        address indexed owner, address indexed spender, uint256 value); }