// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../int/getAvail.sol';
contract hasExtAvailable is hasIntGetAvail {
    function available(address guy, uint[] calldata ids) external view 
    returns (uint[] memory avails) {
        avails = new uint[](ids.length);
        for (uint i; i < avails.length; i++)
            avails[i] = getAvail(guy, ids[i]); }}
