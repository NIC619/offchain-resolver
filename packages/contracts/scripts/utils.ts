import * as fs from "fs";
import * as path from "path";
import { config, network } from "hardhat";

export function writeContractJson(contractName: string, content) {
  const jsonPath = path.join(
    config.paths["root"],
    "scripts",
    network.name,
    "deployments",
    `${contractName}.json`
  );
  const folderPath = path.join(
    config.paths["root"],
    "scripts",
    network.name,
    "deployments"
  );
  if (fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2));
  } else {
    // Create new file if not exist
    fs.mkdirSync(folderPath, { recursive: true });
    fs.appendFileSync(jsonPath, JSON.stringify(content, null, 2));
  }
}
