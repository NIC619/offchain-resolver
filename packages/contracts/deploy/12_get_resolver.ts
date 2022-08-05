import { Contract, BigNumber, Overrides } from "ethers";
import { ethers, network } from "hardhat";
import * as ENSRegiContractHardhat from "~/scripts/hardhat/deployments/ENSRegistry.json";
import * as ENSRegiContractGoerli from "~/scripts/goerli/deployments/ENSRegistry.json";

async function main() {
  let ensRegiContract: Contract;

  // Set default contract instance in Hardhat network
  ensRegiContract = await ethers.getContractAt(
    ENSRegiContractHardhat.abi,
    ENSRegiContractHardhat.address
  );

  // Set contract instance when Goerli testnet is specified
  if (network.name === "goerli") {
    ensRegiContract = await ethers.getContractAt(
      ENSRegiContractGoerli.abi,
      ENSRegiContractGoerli.address
    );
  }

  const subnodeOwner =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const manDomain = "eth";
  const subDomain = "test";
  const fulDomain = `${subDomain}.${manDomain}`;

  // Get *.eth maindomain owner
  const mandomainData = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes32", "bytes32"],
      [subnodeOwner, ethers.utils.id(subDomain)]
    )
  );
  const manDomainOwner = await ensRegiContract.owner(mandomainData);
  console.log(`Main Domain ${manDomain} Owner: ${manDomainOwner}`);

  // Get *.test.eth subdomain owner
  const subDomainData = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes32", "bytes32"],
      [ethers.utils.namehash(manDomain), ethers.utils.id(subDomain)]
    )
  );
  const subDomainOwner = await ensRegiContract.owner(subDomainData);
  console.log(`Sub Domain ${subDomain} Owner: ${subDomainOwner}`);

  // Get *.test.eth subdomain resolver
  const fulDomainData = ethers.utils.namehash(fulDomain);
  const fulDomainResolver = await ensRegiContract.resolver(fulDomainData);
  console.log(`full Domain ${fulDomain} Resolver: ${fulDomainResolver}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
