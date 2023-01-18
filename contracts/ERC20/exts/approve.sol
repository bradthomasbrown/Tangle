// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../vars/allowance.sol';
import '../events/Approval.sol';

contract hasExtApprove is
hasEventApproval,
hasVarAllowance
{

    function approve(
        address spender, 
        uint value
    ) external {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
    }

}