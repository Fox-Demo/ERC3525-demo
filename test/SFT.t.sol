//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {SFT} from "../contracts/SFT.sol";

contract SFTTest is Test {
    SFT sft;

    function setUp() public {
        sft = new SFT();
    }
}
