// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Stream.sol';
import '../structs/Work.sol';

contract hasEventExecute {

    event Execute(address executor, Stream[] stream, Work[] works, Proof[] proofs);

}
