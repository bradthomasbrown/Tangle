// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
struct Req { address sender; uint gas; uint work; uint source; uint dest;
    uint input; uint output; uint id; }