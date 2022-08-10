import * as utils from "~/scripts/utils";
import { ethers, network } from "hardhat";
import { BigNumber, Overrides } from "ethers";
import * as ENSRegistry from "~/artifacts/@ensdomains/ens-contracts/contracts/registry/ENSRegistry.sol/ENSRegistry.json";

async function main() {
  const contractName = "ENSRegistry";
  const addrRecord = await utils.openAddrRecord();
  const deployer = (await ethers.getSigners())[1];

  // Deploy ENSRegistry contract
  console.log("Deploying ENSRegistry contract...");
  await utils.confirmNextContractAddr(deployer);

  // Auto set TX overrides extra argument
  const overrides: Overrides = {
    gasLimit: BigNumber.from(5000000),
    maxFeePerGas: await (await ethers.provider.getFeeData()).maxFeePerGas!,
    maxPriorityFeePerGas: await (
      await ethers.provider.getFeeData()
    ).maxPriorityFeePerGas!,
  };

  // Set deployment info
  const contractInstance = await (
    await ethers.getContractFactory(
      `contracts/${contractName}.sol:${contractName}`,
      deployer
    )
  ).deploy(overrides);

  // Deploy contract
  await contractInstance.deployed();
  console.log(`ENSRegistry contract address: ${contractInstance.address}`);

  // Record contract addresses and update file
  addrRecord[contractName] = contractInstance.address;
  await utils.updateAddrRecord(addrRecord);

  // Write ENSRegistry contract JSON
  utils.writeContractJson(contractName, {
    address: contractInstance.address,
    commit: await utils.getLatestGitHash(),
    abi: ENSRegistry.abi,
  });

  // Verify contract
  const verifyCmd = `npx hardhat verify --network ${network.name} --contract contracts/ENSRegistry.sol:ENSRegistry ${contractInstance.address}`;
  await utils.verifyContract(verifyCmd);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
