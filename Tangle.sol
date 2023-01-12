// SPDX-License-Identifier: 0BSD
pragma solidity ^0.8.17;

import '../ERC20/ERC20.sol';
import '../Farmable/Farmable.sol';
import '../GentleMidnight/GentleMidnight.sol';

contract Tangle is
ERC20,
Farmable,
GentleMidnight
{}