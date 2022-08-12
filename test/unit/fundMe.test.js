const { assert, expect } = require("chai")
const { utils } = require("ethers")
const { ethers, network, deployments, getNamedAccounts } = require("hardhat")

describe("FundMe", function() {
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function() {
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

    describe("constructor", async function() {
        it("sets the aggregator addresses correctly ", async function() {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("Fund", async function() {
        it("Fails if you dont send enough ETH", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Updated the amount funded data structure", async function() {
            const transactionValue = await fundMe.fund({ value: sendValue })
            await transactionValue.wait(1)
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async function() {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function() {
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function() {
            // Arrange

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // We can find the object's elements by starting breakpoint debbuigng session it is quick way without looking session
            const gasCost = transactionReceipt.effectiveGasPrice.mul(
                transactionReceipt.gasUsed
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
    })
})
