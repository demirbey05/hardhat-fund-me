const { getNamedAccounts, deployments, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const DECIMAL = "8"
const INITIAL_ANSWER = "200000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const networkId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        const fundme = await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mock"]
