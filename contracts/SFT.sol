//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC3525} from "@solvprotocol/erc-3525/ERC3525.sol";

contract SFT is ERC3525 {
    constructor() ERC3525("SFT", "MySFT", 18) {}

    function mint(address _to, uint256 _tokenId, uint256 _slot, uint256 _value) public {
        _mint(_to, _tokenId, _slot, _value);
    }

    function balanceOf(uint256 _tokenId) public view override returns (uint256 value) {
        return super.balanceOf(_tokenId);
    }
}
