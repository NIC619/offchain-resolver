import { BigNumber, Contract, Overrides, providers } from "ethers";
import { ethers, network } from "hardhat";
import * as ENSRegiContractHardhat from "~/scripts/hardhat/deployments/ENSRegistry.json";
import * as OffResvContractHardhat from "~/scripts/hardhat/deployments/OffchainResolver.json";
import * as ENSRegiContractGoerli from "~/scripts/goerli/deployments/ENSRegistry.json";
import * as OffResvContractGoerli from "~/scripts/goerli/deployments/OffchainResolver.json";

async function main() {
  const owner = (await ethers.getSigners())[0];
  let ensRegiContract: Contract;
  let offResvContract: Contract;

  // Set default contract instance in Hardhat network
  ensRegiContract = await ethers.getContractAt(
    ENSRegiContractHardhat.abi,
    ENSRegiContractHardhat.address
  );
  offResvContract = await ethers.getContractAt(
    OffResvContractHardhat.abi,
    OffResvContractHardhat.address
  );

  // Set contract instance when Goerli testnet is specified
  if (network.name === "goerli") {
    ensRegiContract = await ethers.getContractAt(
      ENSRegiContractGoerli.abi,
      ENSRegiContractGoerli.address
    );
    offResvContract = await ethers.getContractAt(
      OffResvContractGoerli.abi,
      OffResvContractGoerli.address
    );
    console.log(
      `ENSRegistry contract on etherscan: https://goerli.etherscan.io/address/${ensRegiContract.address}`
    );
    console.log(
      `OffchainResolver contract on etherscan: https://goerli.etherscan.io/address/${offResvContract.address}`
    );
  }

  const overrides: Overrides = {
    gasLimit: BigNumber.from(5000000),
    maxFeePerGas: await (await ethers.provider.getFeeData()).maxFeePerGas!,
    maxPriorityFeePerGas: await (
      await ethers.provider.getFeeData()
    ).maxPriorityFeePerGas!,
  };

  const subnodeOwner =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const manDomain = "eth";
  const subDomain = "test";
  const fulDomain = `${subDomain}.${manDomain}`;

  let tx: providers.TransactionResponse;
  let txReceipt: providers.TransactionReceipt;

  // Set *.eth maindomain owner
  tx = await ensRegiContract.connect(owner).setSubnodeOwner(
    subnodeOwner,
    ethers.utils.id(manDomain), // sha3 func
    owner.address,
    overrides
  );
  txReceipt = await tx.wait(); // Wait for transaction to confirm that block has been mined
  console.log(`Set maindomain owner TX hash: ${txReceipt.transactionHash}`);

  // Set *.test.eth subdomain owner
  tx = await ensRegiContract.connect(owner).setSubnodeOwner(
    ethers.utils.namehash(manDomain),
    ethers.utils.id(subDomain), // sha3 func
    owner.address,
    overrides
  );
  txReceipt = await tx.wait(); // Wait for transaction to confirm that block has been mined
  console.log(`Set subomain owner TX hash: ${txReceipt.transactionHash}`);

  // Set *.test.eth subdomain resolver
  tx = await ensRegiContract
    .connect(owner)
    .setResolver(
      ethers.utils.namehash(fulDomain),
      offResvContract.address,
      overrides
    );
  txReceipt = await tx.wait(); // Wait for transaction to confirm that block has been mined
  console.log(`Set subdomain resolver TX hash: ${txReceipt.transactionHash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
