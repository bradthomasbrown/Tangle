// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/updateFarm.sol';
import '../int/getAvail.sol';
import '../int/move.sol';
import '../var/farms.sol';
contract hasExtClaim is hasIntGetAvail, hasIntMove {
    function claim(string[] calldata ids) external {
        for (uint i; i < ids.length; i++) {
            Acc storage acc = accs[ids[i]][msg.sender];
            Farm storage farm = farms[ids[i]];
            updateFarm(farm);
            uint avail = getAvail(msg.sender, ids[i]);
            move(address(this), msg.sender, avail);
            acc.sigma = farm.sigma;
            acc.reward = 0; }
        emit Claim(msg.sender, ids); }
    event Claim(address claimer, string[] ids); }