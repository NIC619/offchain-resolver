import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "tsconfig-paths/register";

const real_accounts = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
  accountsBalance: "1000000000000000000000000",
};
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ALCHEMY_TOKEN = process.env.ALCHEMY_TOKEN || "";

const gatewayurl =
  "https://offchain-resolver-example.uc.r.appspot.com/{sender}/{data}.json";

module.exports = {
  solidity: "0.8.10",
  networks: {
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
    },
    arbitrum_kovan: {
      url: "https://kovan5.arbitrum.io/rpc",
      gasPrice: 0,
    },
    arbitrum_rinkeby: {
      url: "https://rinkeby.arbitrum.io/rpc",
      gasPrice: 0,
    },
    hardhat: {
      throwOnCallFailures: false,
      chainId: 1337,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_TOKEN}`,
        blockNumber: 14340000,
      },
      gatewayurl: "http://localhost:8080/{sender}/{data}.json",
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_TOKEN}`,
      tags: ["test", "demo"],
      chainId: 3,
      accounts: real_accounts,
      gatewayurl,
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_TOKEN}`,
      tags: ["test", "demo"],
      chainId: 4,
      accounts: real_accounts,
      gatewayurl,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_TOKEN}`,
      tags: ["test", "demo"],
      chainId: 5,
      accounts: real_accounts,
      gatewayurl,
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_TOKEN}`,
      tags: ["demo"],
      chainId: 1,
      accounts: real_accounts,
      gatewayurl,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    signer: {
      default: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
    deployer: {
      default: 1,
    },
  },
};
