const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const networkId = network.config.chainId
    let priceFeedAddress
    let developedChains = true
    if (!developmentChains.includes(network.name)) {
        priceFeedAddress = networkConfig[networkId]["ethUsdPriceFeed"]
        developedChains = false
    } else {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        priceFeedAddress = ethUsdAggregator.address
    }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundme = await deploy("FundMe", {
        from: deployer,
        args: [priceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (!developedChains) {
        log("Contract is verifying---------------")
        await verify(fundme.address, [priceFeedAddress])
        log("Contract is verified---------------")
    }
}
module.exports.tags = ["all", "fundme"]
