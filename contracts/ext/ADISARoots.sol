// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/log2.sol';
import '../var/ADISA.sol';
contract hasExtADISARoots is hasVarADISA {
    function ADISARoots() external view returns (bytes32[] memory roots) {
        uint ADISARootCount = adisa.count == 0 ? 0 : log2(adisa.count) + 1;
        roots = new bytes32[](ADISARootCount);
        for (uint i; i < ADISARootCount; i++) roots[i] = adisa.roots[i]; }}
