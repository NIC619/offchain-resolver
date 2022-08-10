import * as path from "path";
import { config, network } from "hardhat";

const networkName = network.name;

// Get Signer address from AddressRecord.json
const addrRecordPath = require(path.join(
  config.paths["root"],
  "scripts",
  networkName,
  "deployments",
  "AddressRecord.json"
));
const signerAddress = addrRecordPath["Signer"];

// Get gateway URL from Hardhat config
const gatewayURL = network.config["gatewayurl"];

// Export
module.exports = [gatewayURL, [signerAddress]];
