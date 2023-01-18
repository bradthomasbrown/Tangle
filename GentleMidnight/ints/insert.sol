// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './ruler.sol';
import '../structs/ZippySoup.sol';
import '../structs/AER_1.sol';

function insert(
    ZippySoup storage zs,
    AER_0 calldata a0,
    address msgSender,
    uint msgValue
) {
    uint count = zs.count++;
    uint r = ruler(count);
    bytes32 h = keccak256(abi.encode(AER_1(a0, msgSender, msgValue, count)));
    for (uint i; i < r; i++) h = keccak256(abi.encode(zs.roots[i], h));
    zs.roots[r] = h;
}