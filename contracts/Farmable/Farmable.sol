// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './exts/adjustStake.sol';
import './exts/airdrop.sol';
import './exts/available.sol';
import './exts/claim.sol';

contract Farmable is
hasExtAdjustStake,
hasExtAirdrop,
hasExtAvailable,
hasExtClaim
{}