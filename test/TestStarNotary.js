// const { assert } = require("console");
// const truffleAssert = require("truffle-assertions");

const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.approve(user2, starId, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
}).timeout(10000);

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  //-------------------------------------------------
  const gasPrice = web3.utils.toWei(".000001", "ether");
  await instance.approve(user2, starId, { from: user1, gasPrice: gasPrice });
  //-------------------------------------------------
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction) - Number(gasPrice);

  console.log("value1: " + value1);
  console.log("value 2: " + value2);

  // assert.equal(value1, value2);
  // done();
}).timeout(10000);

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  //-------------------------------------------------
  const gasPrice = web3.utils.toWei(".000001", "ether");
  await instance.approve(user2, starId, { from: user1, gasPrice: gasPrice });
  //-------------------------------------------------
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
}).timeout(10000);

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);

  //-------------------------------------------------
  const gasPrice = web3.utils.toWei(".000001", "ether");
  await instance.approve(user2, starId, { from: user1, gasPrice: gasPrice });
  //-------------------------------------------------
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  console.log("value: " + value);
  console.log("star Price: " + starPrice);
  // assert.equal(value, starPrice);
  // done();
}).timeout(10000);

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  tokenId = 6;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  let name = await instance.name();
  let symbol = await instance.symbol();
  console.log(name);
  console.log(symbol);
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  // 3. Verify that the owners changed
  let instance = await StarNotary.deployed();
  let token1 = 7;
  let token2 = 8;
  let user1 = accounts[0];
  let user2 = accounts[1];
  await instance.createStar("Star A", token1, { from: user1 });
  await instance.createStar("Star B", token2, { from: user2 });
  await instance.exchangeStars(token1, token2);
  assert.equal(await instance.ownerOf(token1), user2);
  assert.equal(await instance.ownerOf(token2), user1);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.
  let instance = await StarNotary.deployed();
  let token1 = 9;
  let toUser = accounts[1];
  await instance.createStar("Star A", token1, { from: accounts[0] });
  await instance.transferStar(toUser, token1);
  assert.equal(await instance.ownerOf.call(token1), toUser);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same
  let instance = await StarNotary.deployed();
  let token1 = 10;
  let name = "Star A";
  await instance.createStar(name, token1, { from: accounts[0] });
  let starInfo = await instance.lookUptokenIdToStarInfo(token1);
  console.log("star info " + starInfo);
  // let name = await instance.name();
  // console.log("star name" + name);
  assert.equal(name, starInfo);
});
