const { ethers, tracer } = require("hardhat");
const { expect } = require("chai");

let SFT, sft;
let deployer, user1, user2;

const tokenId = 1;
const slot = 1;
const value = 10000;

describe("SFT", function () {
  before(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    SFT = await ethers.getContractFactory("SFT");
  });

  beforeEach(async function () {
    sft = await SFT.deploy();
    await sft.deployed();
  });

  describe("Deployment", function () {
    it("Mint", async function () {
      const ownedToken = 1;

      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;
      expect(await sft.slotOf(tokenId)).to.equal(slot);
      expect(await sft["balanceOf(uint256)"](tokenId)).to.equal(value);
      expect(await sft["balanceOf(address)"](user1.address)).to.equal(
        ownedToken
      );
      expect(await sft.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("Approve value", async function () {
      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;
      await expect(
        sft
          .connect(user1)
          ["approve(uint256,address,uint256)"](tokenId, user2.address, value)
      ).to.not.reverted;

      expect(await sft.allowance(tokenId, user2.address)).to.equal(value);
    });

    it("Approve token ownership", async function () {
      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;
      await expect(
        sft.connect(user1)["approve(address,uint256)"](user2.address, tokenId)
      ).to.not.reverted;

      expect(await sft.getApproved(tokenId)).to.equal(user2.address);
    });

    it("Transfer token value to user2", async function () {
      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;

      await expect(
        sft
          .connect(user1)
          ["approve(uint256,address,uint256)"](tokenId, user2.address, value)
      ).to.not.reverted;

      const newTokenId = tokenId + 1;

      //還沒有transfer之前，user2沒有任何token
      expect(await sft["balanceOf(address)"](user2.address)).to.equal(0);
      await expect(sft["balanceOf(uint256)"](newTokenId)).to.revertedWith(
        "ERC3525: invalid token ID"
      );

      await expect(
        sft
          .connect(user2)
          ["transferFrom(uint256,address,uint256)"](
            tokenId,
            user2.address,
            value
          )
      ).to.not.reverted;

      //User2 得到一個新的tokenId(原tokenId + 1)
      expect(await sft["balanceOf(address)"](user2.address)).to.equal(1);
      expect(await sft["balanceOf(uint256)"](newTokenId)).to.equal(value);
    });

    it("Transfer token ownership to user2", async function () {
      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;

      await expect(
        sft.connect(user1)["approve(address,uint256)"](user2.address, tokenId)
      ).to.not.reverted;

      const newTokenId = tokenId + 1;

      //還沒有transfer之前，user2沒有任何token
      expect(await sft["balanceOf(address)"](user2.address)).to.equal(0);
      await expect(sft["balanceOf(uint256)"](newTokenId)).to.revertedWith(
        "ERC3525: invalid token ID"
      );

      await expect(
        sft
          .connect(user2)
          ["transferFrom(address,address,uint256)"](
            user1.address,
            user2.address,
            tokenId
          )
      ).to.not.reverted;

      expect(await sft.ownerOf(tokenId)).to.equal(user2.address);
      expect(await sft["balanceOf(address)"](user2.address)).to.equal(1);
    });

    it("Transfer token value when approve ownership", async function () {
      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;
      await expect(
        sft.connect(user1)["approve(address,uint256)"](user2.address, tokenId)
      ).to.not.reverted;

      const newTokenid = tokenId + 1;

      await expect(
        sft
          .connect(user2)
          ["transferFrom(uint256,address,uint256)"](
            tokenId,
            user2.address,
            value
          )
      ).to.not.reverted;

      expect(await sft.ownerOf(tokenId)).to.equal(user1.address);
      expect(await sft["balanceOf(uint256)"](newTokenid)).to.equal(value);
      expect(await sft["balanceOf(address)"](user2.address)).to.equal(1);
    });

    it("Transfer token ownership to user2 by user1", async function () {
      await expect(sft.mint(user1.address, slot, value)).to.not.reverted;

      await expect(
        sft
          .connect(user1)
          ["approve(uint256,address,uint256)"](tokenId, user2.address, value)
      ).to.not.reverted;

      await expect(
        sft
          .connect(user2)
          ["transferFrom(address,address,uint256)"](
            user1.address,
            user2.address,
            tokenId
          )
      ).to.revertedWith("ERC3525: transfer caller is not owner nor approved");
    });
  });
});
