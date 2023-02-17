// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../ext/payGens.sol';
import '../ext/updateHoldAcc.sol';
import '../int/getAvail.sol';
import '../int/move.sol';
contract hasExtClaim is hasIntMove, hasExtPayGens, hasExtUpdateHoldAcc, 
hasIntGetAvail {
    function claim(uint[] calldata ids) external {
        for (uint i; i < ids.length; i++) {
            Acc storage acc = accs[FarmID(ids[i])][msg.sender];
            Farm storage farm = farms[FarmID(ids[i])];
            updateFarm(farm);
            uint avail = getAvail(msg.sender, ids[i]);
            move(address(this), msg.sender, avail);
            acc.sigma = farm.sigma;
            acc.reward = 0; }
        emit Claim(msg.sender, ids); }
    event Claim(address claimer, uint[] ids); }