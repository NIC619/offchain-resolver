import { BigNumber, Overrides } from "ethers";
import { ethers } from "hardhat";
import * as utils from "~/scripts/utils";
import * as ENSRegistry from "@ensdomains/ens/build/contracts/ENSRegistry.json";

async function main() {
  const contractName = "ENSRegistry";
  const owner = (await ethers.getSigners())[0];

  const overrides: Overrides = {
    gasLimit: BigNumber.from(5000000),
    maxFeePerGas: await (await ethers.provider.getFeeData()).maxFeePerGas!,
    maxPriorityFeePerGas: await (
      await ethers.provider.getFeeData()
    ).maxPriorityFeePerGas!,
  };

  // Set deployment info
  const contractInstance = await (
    await ethers.getContractFactory(contractName, owner)
  ).deploy(overrides);

  // Deploy contract
  await contractInstance.deployed();

  // Write ENSRegistry contract JSON
  utils.writeContractJson(contractName, {
    address: contractInstance.address,
    abi: ENSRegistry.abi,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
