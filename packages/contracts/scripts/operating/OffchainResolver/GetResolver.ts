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

  const dotDomain = "0x" + "00".repeat(32);
  const ethDomain = "eth";
  const mainDomain = "token";
  const fullDomain = `${mainDomain}.${ethDomain}`;

  // Get ethdomain owner
  const ethdomainData = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes32", "bytes32"],
      [dotDomain, ethers.utils.id(ethDomain)]
    )
  );
  const ethDomainOwner = await ensRegiContract.owner(ethdomainData);
  console.log(`Get ethdomain \"${ethDomain}\" owner: ${ethDomainOwner}`);

  // Get maindomain owner
  const mainDomainData = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes32", "bytes32"],
      [ethers.utils.namehash(ethDomain), ethers.utils.id(mainDomain)]
    )
  );
  const mainDomainOwner = await ensRegiContract.owner(mainDomainData);
  console.log(`Get maindomain \"${mainDomain}\" owner: ${mainDomainOwner}`);

  // Get fulldomain resolver
  const fullDomainData = ethers.utils.namehash(fullDomain);
  const fullDomainResolver = await ensRegiContract.resolver(fullDomainData);
  console.log(
    `Get fulldomain \"${fullDomain}\" resolver contract: ${fullDomainResolver}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
