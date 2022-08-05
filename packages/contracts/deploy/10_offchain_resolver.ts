import { BigNumber, Overrides } from "ethers";
import { ethers, network, getNamedAccounts } from "hardhat";
import * as utils from "~/scripts/utils";
import * as OffchainResolver from "~/artifacts/contracts/OffchainResolver.sol/OffchainResolver.json";

async function main() {
  const contractName = "OffchainResolver";

  // Get deployer address, signer address, gateway URL from Hardhat network config
  const { deployer, signer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const gatewayURL = network.config["gatewayurl"];

  const overrides: Overrides = {
    gasLimit: BigNumber.from(5000000),
    maxFeePerGas: await (await ethers.provider.getFeeData()).maxFeePerGas!,
    maxPriorityFeePerGas: await (
      await ethers.provider.getFeeData()
    ).maxPriorityFeePerGas!,
  };

  // Set deployment info
  const contractInstance = await (
    await ethers.getContractFactory(contractName, deployerSigner)
  ).deploy(gatewayURL, [signer], overrides);

  // Deploy contract
  await contractInstance.deployed();

  // Write OffchainResolver contract JSON
  utils.writeContractJson(contractName, {
    address: contractInstance.address,
    abi: OffchainResolver.abi,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
