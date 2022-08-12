import * as fs from "fs";
import * as path from "path";
import { Signer } from "ethers";
import simpleGit from "simple-git";
import { execSync } from "child_process";
import { ethers, config, network } from "hardhat";
import { default as prompts } from "prompts";

/*********************************
 *  Different from private repo  *
 *********************************/

const networkName = network.name;

export async function getLatestGitHash(): Promise<String> {
  const localGit = simpleGit(process.cwd());
  // Get the latest status
  const latest = (await localGit.log()).latest;

  // Get the latest hash
  return latest ? latest.hash : "";
}

function getAddrRecordPath() {
  return path.join(
    config.paths["root"],
    "deployments",
    networkName,
    "AddressRecord.json"
  );
}

export function getENSRegiJson() {
  const ensRegiJSON = require(path.join(
    config.paths["root"],
    "deployments",
    networkName,
    "ENSRegistry.json"
  ));
  return ensRegiJSON;
}

export function getOffResvJson() {
  const offResvJSON = require(path.join(
    config.paths["root"],
    "deployments",
    networkName,
    "OffchainResolver.json"
  ));
  return offResvJSON;
}

export function writeContractJson(contractName: string, content) {
  const jsonPath = path.join(
    config.paths["root"],
    "deployments",
    networkName,
    `${contractName}.json`
  );
  // The folder where Json is located
  const folderPath = path.join(
    config.paths["root"],
    "deployments",
    networkName
  );
  if (fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2));
  } else {
    // Create new folder and file if not exist
    fs.mkdirSync(folderPath, { recursive: true });
    fs.appendFileSync(jsonPath, JSON.stringify(content, null, 2));
  }
}

export async function verifyContract(cmd: string) {
  const promptResult = await prompts(
    {
      type: "confirm",
      name: "doVerify",
      message: `Verify contract on etherscan (If fails, please execute this cmd again)\ncmd : ${cmd} ?`,
    },
    {
      onCancel: async function () {
        console.log("Exit process");
        process.exit(0);
      },
    }
  );

  if (promptResult.doVerify) {
    execSync(cmd, { stdio: "inherit" });
  }
}

/*********************************
 *     Same as private repo      *
 *********************************/

export async function updateAddrRecord(addrRecord) {
  // Expect file exists already
  let addrRecordPath = getAddrRecordPath();
  fs.writeFileSync(addrRecordPath, JSON.stringify(addrRecord, null, 2));
  return;
}

export async function openAddrRecord() {
  let addrRecordPath = getAddrRecordPath();
  let addrRecord = new Map();
  if (fs.existsSync(addrRecordPath)) {
    let raw = fs.readFileSync(addrRecordPath);
    addrRecord = JSON.parse(raw.toString());
  } else {
    fs.writeFileSync(addrRecordPath, "{}");
  }

  return addrRecord;
}

export async function confirmNextContractAddr(deployer: Signer) {
  const contractAddr = ethers.utils.getContractAddress({
    from: await deployer.getAddress(),
    nonce: await deployer.getTransactionCount(),
  });

  const promptResult = await prompts(
    {
      type: "confirm",
      name: "correct",
      message: `Expected new contract address : ${contractAddr}, is this correct?`,
    },
    {
      onCancel: async function () {
        console.log("Exit process");
        process.exit(0);
      },
    }
  );

  if (!promptResult.correct) {
    process.exit(0);
  }

  return;
}
