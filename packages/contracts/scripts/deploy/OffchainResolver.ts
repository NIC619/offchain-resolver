import { BigNumber, Overrides } from "ethers";
import { ethers, network } from "hardhat";
import * as utils from "~/scripts/utils";
import * as OffchainResolver from "~/artifacts/contracts/OffchainResolver.sol/OffchainResolver.json";

async function main() {
  const contractName = "OffchainResolver";
  const addrRecord = await utils.openAddrRecord();
  const deployer = (await ethers.getSigners())[1];
  const signerAddress = addrRecord["Signer"];
  const gatewayURL = network.config["gatewayurl"];

  // Deploy OffchainResolver contract
  console.log("Deploying OffchainResolver contract...");
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
  ).deploy(gatewayURL, [signerAddress], overrides);

  // Deploy contract
  await contractInstance.deployed();
  console.log(`OffchainResolver contract address: ${contractInstance.address}`);

  // Record contract addresses and update file
  addrRecord[contractName] = contractInstance.address;
  await utils.updateAddrRecord(addrRecord);

  // Write OffchainResolver contract JSON
  utils.writeContractJson(contractName, {
    address: contractInstance.address,
    commit: await utils.getLatestGitHash(),
    abi: OffchainResolver.abi,
  });

  // Verify contract
  const verifyCmd = `npx hardhat verify --network ${network.name} --contract contracts/OffchainResolver.sol:OffchainResolver ${contractInstance.address} --constructor-args ./scripts/${network.name}/deployments/OffchainResolverVerifyArguments.ts`;
  await utils.verifyContract(verifyCmd);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
