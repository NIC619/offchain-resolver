import { BigNumber, Overrides, providers } from "ethers";
import { ethers, network } from "hardhat";
import * as utils from "~/scripts/utils";

async function main() {
  const addrRecord = await utils.openAddrRecord();
  const owner = (await ethers.getSigners())[0];
  const deployer = (await ethers.getSigners())[1];
  const ownerAddress = addrRecord["Owner"];

  // Set contract instance
  const ENSRegiJson = await utils.getENSRegiJson();
  const ensRegiContract = await ethers.getContractAt(
    ENSRegiJson.abi,
    ENSRegiJson.address
  );
  const OffResvJson = await utils.getOffResvJson();
  const offResvContract = await ethers.getContractAt(
    OffResvJson.abi,
    OffResvJson.address
  );
  const etherscanURL = `https://${
    network.name === "mainnet" ? "" : network.name + "."
  }etherscan.io`;
  console.log(
    `ENSRegistry contract on etherscan: ${etherscanURL}/address/${ensRegiContract.address}`
  );
  console.log(
    `OffchainResolver contract on etherscan: ${etherscanURL}/address/${offResvContract.address}`
  );

  // Set TX overrides extra argument
  const overrides: Overrides = {
    gasLimit: BigNumber.from(5000000),
    maxFeePerGas: await (await ethers.provider.getFeeData()).maxFeePerGas!,
    maxPriorityFeePerGas: await (
      await ethers.provider.getFeeData()
    ).maxPriorityFeePerGas!,
  };

  const dotDomain = "0x" + "00".repeat(32);
  const ethDomain = "eth";
  const mainDomain = "token";
  const fullDomain = `${mainDomain}.${ethDomain}`;

  let tx: providers.TransactionResponse;
  let txReceipt: providers.TransactionReceipt;

  // Set ethdomain manager to Owner by Deployer
  tx = await ensRegiContract.connect(deployer).setSubnodeOwner(
    dotDomain,
    ethers.utils.id(ethDomain), // Compute the keccak256 cryptographic hash
    ownerAddress,
    overrides
  );
  txReceipt = await tx.wait(); // Wait for transaction to confirm that block has been mined
  console.log(
    `Set ethdomain \"${ethDomain}\" owner, TX: ${etherscanURL}/tx/${txReceipt.transactionHash}`
  );

  // Set maindomain manager to Owner by above setting Owner
  tx = await ensRegiContract.connect(owner).setSubnodeOwner(
    ethers.utils.namehash(ethDomain), // Compute the namehash of ensName
    ethers.utils.id(mainDomain), // Compute the keccak256 cryptographic hash
    ownerAddress,
    overrides
  );
  txReceipt = await tx.wait(); // Wait for transaction to confirm that block has been mined
  console.log(
    `Set maindomain \"${mainDomain}\" owner, TX: ${etherscanURL}/tx/${txReceipt.transactionHash}`
  );

  // Set fulldomain resolver contract to OffchainResolver by Owner
  tx = await ensRegiContract.connect(owner).setResolver(
    ethers.utils.namehash(fullDomain), // Compute the namehash of ensName
    offResvContract.address,
    overrides
  );
  txReceipt = await tx.wait(); // Wait for transaction to confirm that block has been mined
  console.log(
    `Set fulldomain \"${fullDomain}\" resolver contract, TX: ${etherscanURL}/tx/${txReceipt.transactionHash}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
