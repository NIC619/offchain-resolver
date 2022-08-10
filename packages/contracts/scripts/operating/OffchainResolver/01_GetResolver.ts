import { ethers, network } from "hardhat";
import * as utils from "~/scripts/utils";

async function main() {
  // Set contract instance
  const ENSRegiJson = await utils.getENSRegiJson();
  const ensRegiContract = await ethers.getContractAt(
    ENSRegiJson.abi,
    ENSRegiJson.address
  );
  const etherscanURL = `https://${
    network.name === "mainnet" ? "" : network.name + "."
  }etherscan.io`;
  console.log(
    `ENSRegistry contract on etherscan: ${etherscanURL}/address/${ensRegiContract.address}`
  );

  const ethDomain = "eth";
  const manDomain = "token";
  const fulDomain = `${manDomain}.${ethDomain}`;

  // Get maindomain owner
  const subDomainData = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes32", "bytes32"],
      [ethers.utils.namehash(ethDomain), ethers.utils.id(manDomain)]
    )
  );
  const subDomainOwner = await ensRegiContract.owner(subDomainData);
  console.log(`Get maindomain \"${manDomain}\" Owner: ${subDomainOwner}`);

  // Get fulldomain resolver
  const fulDomainData = ethers.utils.namehash(fulDomain);
  const fulDomainResolver = await ensRegiContract.resolver(fulDomainData);
  console.log(`Get fulldomain \"${fulDomain}\" Resolver: ${fulDomainResolver}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
