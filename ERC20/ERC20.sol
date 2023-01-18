// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './exts/approve.sol';
import './exts/transfer.sol';
import './exts/transferFrom.sol';
import './vars/decimals.sol';
import './vars/name.sol';
import './vars/symbol.sol';
import './vars/totalSupply.sol';

contract ERC20 is
hasExtApprove,
hasExtTransfer,
hasExtTransferFrom,
hasVarDecimals,
hasVarName,
hasVarSymbol,
hasVarTotalSupply
{}