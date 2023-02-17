// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../var/liquidityPool.sol';
contract hasExtSetLiquidityPool is hasVarLiquidityPool {
    function setLiquidityPool(address newLiquidityPool) external {
        liquidityPool = ERC20(newLiquidityPool); }}
