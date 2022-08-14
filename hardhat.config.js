require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("hardhat-gas-reporter")

RINKEBY_RPC_URL =
    process.env.RINKEBY_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
    },
    solidity: {
        compilers: [{ version: "0.8.9" }, { version: "0.6.6" }],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        //coinmarketcap: COINMARKETCAP_API_KEY,
    },
}
