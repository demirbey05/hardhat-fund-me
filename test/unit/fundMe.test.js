const { assert, expect } = require("chai")
const { utils } = require("ethers")
const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config.js")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let mockV3Aggregator
          let deployer
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async function () {
              // Deploy our fundMe Contract first
              const accounts = await ethers.getSigners() // returns the accounts key at the hardhat config file
              const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer // Get connection to user

              await deployments.fixture(["all"]) // Run our deploy folder with tags

              fundMe = await ethers.getContract("FundMe", deployer) // Get connection from the contract

              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly ", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("Fund", async function () {
              it("Fails if you dont send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updated the amount funded data structure", async function () {
                  const transactionValue = await fundMe.fund({
                      value: sendValue,
                  })
                  await transactionValue.wait(1)
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of s_funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.s_funders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async function () {
                  // Arrange

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // We can find the object's elements by starting breakpoint debbuigng session
                  //it is quick way without looking api docs
                  const gasCost = transactionReceipt.effectiveGasPrice.mul(
                      transactionReceipt.gasUsed
                  )
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple s_s_funders", async function () {
                  // Arange
                  const accounts = await ethers.getSigners()
                  // Get the accounts at the field accounts on harhat-config.js
                  for (let i = 1; i < 6; i++) {
                      // We cannot start with 0 index because zero is deployer
                      const fundMeConnected = await fundMe.connect(accounts[i])
                      // We need to connect with another account else our transactions is signed by deployer
                      await fundMeConnected.fund({ value: sendValue })
                  }

                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { effectiveGasPrice, gasUsed } = transactionReceipt
                  const gasCost = effectiveGasPrice.mul(gasUsed)

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert

                  assert.equal(
                      startingContractBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.s_funders(0)).to.be.reverted
              })
          })

          it("Only allow the owner withdraw", async function () {
              const accounts = await ethers.getSigners()
              // Get the accounts at the field accounts on harhat-config.js
              const attacker = accounts[1]
              const connectedContract = await fundMe.connect(attacker)

              await expect(
                  connectedContract.withdraw()
              ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
          })
      })
