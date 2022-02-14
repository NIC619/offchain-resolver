const { ethers } = require("hardhat");  
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();
    var GATEWAY_HOST = 'https://offchain-resolver-example.uc.r.appspot.com'
    var gatewayUrl = `${GATEWAY_HOST}/{sender}/{data}.json`
    await deploy('OffchainResolver', {
        from: deployer,
        args: [gatewayUrl, [owner]],
        log: true,
    });
    // etherscan verification command
    // INFURA_ID=$INFURA_ID ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY npx hardhat verify --constructor-args arguments.js --network ropsten $OFFCHAIN_RESOLVER_ADDRESS
};
module.exports.tags = ['demo'];
