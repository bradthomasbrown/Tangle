// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/NewRequest.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../../ERC20/events/Transfer.sol';
import '../../Farmable/ints/adjustPoints.sol';
import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/vars/accounts.sol';
import '../../Farmable/vars/farms.sol';
import '../../Farmable/vars/generator.sol';
import '../../Tangle/vars/minBal.sol';
import '../ints/insert.sol';
import '../structs/Request.sol';
import '../vars/ADISA.sol';

contract hasExtTrade is
hasEventTransfer,
hasEventNewRequest,
hasVarBalanceOf,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarADISA,
hasVarMinBal
{
    function trade(
        uint gas,
        uint work, 
        uint dest,
        uint output
    ) external payable
    {
        
        require(work != 0, 'zero work');

        if (balanceOf[msg.sender] - gas < minBal) gas -= minBal;
        Farm storage farm = farms['hold'];
        Account storage account = accounts['hold'][msg.sender];
        adjustPoints(generator, farm, account, -int(gas));
        balanceOf[msg.sender] -= gas;
        balanceOf[address(this)] += gas;
        emit Transfer(msg.sender, address(this), gas);
        adjustGenerator(generator, gas);

        Request memory request = Request(
            msg.sender,
            gas,
            work,
            block.chainid,
            dest,
            msg.value,
            output,
            adisa.count++
        );
        insert(adisa, request);
        emit NewRequest(request);

    }
}