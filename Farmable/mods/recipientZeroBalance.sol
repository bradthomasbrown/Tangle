// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/vars/balanceOf.sol';

contract hasModRecipientZeroBalance is
hasVarBalanceOf
{
    
    modifier recipientZeroBalance(address recipient) {
        require(balanceOf[recipient] == 0, 'recipient nonzero balance');
        _;
    }

}
