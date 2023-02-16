// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import './generated.sol';
import '../struct/Farm.sol';
function updateFarm(Farm storage farm) {
   if (farm.points == 0) return;
   farm.sigma += (generated(farm.gen) - farm.reward) / farm.points;
   farm.reward = generated(farm.gen); }