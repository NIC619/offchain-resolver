import { Command } from 'commander';
import ethers from 'ethers';
import { formatsByName } from '@ensdomains/address-encoder';

const program = new Command();
program
  .requiredOption('-r --registry <address>', 'ENS registry address')
  .option('-p --provider <url>', 'web3 provider URL', 'http://localhost:8545/')
  .option('-i --chainId <chainId>', 'chainId', '1337')
  .option('-n --chainName <name>', 'chainName', 'unknown')
  .argument('<name>');

program.parse(process.argv);
const options = program.opts();
const ensAddress = options.registry;
const chainId = parseInt(options.chainId);
const chainName = options.chainName;
const provider = new ethers.providers.JsonRpcProvider(options.provider, {
  chainId,
  name: chainName,
  ensAddress,
});
(async () => {
  let name = program.args[0];
  let resolved = false;
  // Try to get the coin/email name from first element of domain name to resolve
  // Resolve email from new domain name
  if (isGivenEmail(name)) {
    resolveGivenEmail(name);
    resolved = true;
  }

  // Coin resolution is successful, print the specified coin address
  if (isGivenCoin(name)) {
    resolveGivenCoin(name);
    resolved = true;
  }

  // Coin resolution fails, print all info
  if (!resolved) {
    resolveAllData(name);
  }
})();

// Decode address to EIP-2304 onchain hex string
function addressToOnchainHex(address: string, coinType: string): string {
  const onchain = formatsByName[coinType].decoder(address);
  return `0x${onchain.toString('hex')}`;
}

// Determine if the first name in the domain is a name of a email
function isGivenEmail(domain: string): boolean {
  // Try to get the first name in the domain
  const domainArray = domain.split('.');
  if (domainArray.length <= 1) {
    console.log(`[Error] Domain must have at least one dot "."`);
    process.exit(0);
  }
  const firstName = domainArray[0].toUpperCase();
  return firstName === 'EMAIL';
}

// Determine if the first name in the domain is a name of a coin
function isGivenCoin(domain: string): boolean {
  // Try to get the first name in the domain
  const domainArray = domain.split('.');
  if (domainArray.length <= 1) {
    console.log(`[Error] Domain must have at least one dot "."`);
    process.exit(0);
  }
  const coinName = domainArray[0]; // Get first element
  return isCoin(coinName);
}

// Determine if the name is name of a coin
function isCoin(name: string): boolean {
  const coinType = getCoinType(name);
  return coinType === null ? false : true;
}

// Get coin type from the name
// Coin type reference: https://github.com/satoshilabs/slips/blob/master/slip-0044.md#registered-coin-types
function getCoinType(coinName: string): number | null {
  let coinType: number | null = null;
  switch (coinName.toUpperCase()) {
    case 'ETH': {
      coinType = 60;
      break;
    }
    case 'BTC': {
      coinType = 0;
      break;
    }
    case 'LTC': {
      coinType = 2;
      break;
    }
  }
  return coinType;
}

// Resolve the specific Email from domain name
async function resolveGivenEmail(domain: string) {
  const domainArray = domain.split('.');

  // Remove Email name from domain
  // E.g.: email.token.eth -> token.eth
  const name = domainArray.slice(1, domainArray.length).join('.');

  console.log(`Resolving ${name} domain...`);
  const resolver = await provider.getResolver(name);

  if (!resolver) {
    console.log(`[Error] No resolver contract found`);
    process.exit(0);
  }

  const emailAddress = await resolver.getText('email');
  console.log(`Email address: ${emailAddress}`);
}

// Resolve the specific coin address from domain name
async function resolveGivenCoin(domain: string) {
  const domainArray = domain.split('.');
  // Get first element as coin name
  const coinName = domainArray[0];
  const coinType = getCoinType(coinName)!;
  const coinNameToUpper = coinName.toUpperCase();

  // Remove coin name from domain
  // E.g.: btc.token.eth -> token.eth
  const name = domainArray.slice(1, domainArray.length).join('.');

  console.log(`Resolving ${name} domain...`);
  const resolver = await provider.getResolver(name);

  if (!resolver) {
    console.log(`[Error] No resolver contract found`);
    process.exit(0);
  }

  const coinAddress = await resolver.getAddress(coinType);
  console.log(`${coinNameToUpper} address: ${coinAddress}`);
  console.log(
    `\t└─ decode to onchain hex: ${addressToOnchainHex(
      coinAddress,
      coinNameToUpper // Uppercase english required
    )}`
  );
}

// Resolve all info from domain name
async function resolveAllData(domain: string) {
  console.log(`Resolving ${domain} domain...`);
  const resolver = await provider.getResolver(domain);

  if (!resolver) {
    console.log(`[Error] No resolver contract found`);
    process.exit(0);
  }

  const ethAddress = await resolver.getAddress();
  const btcAddress = await resolver.getAddress(0);
  const ltcAddress = await resolver.getAddress(2);
  const email = await resolver.getText('email');
  const content = await resolver.getContentHash();

  console.log(`Resolver contract address: ${resolver.address}`);
  console.log(`ETH address: ${ethAddress}`);
  console.log(`LTC address: ${ltcAddress}`);
  console.log(
    `\t└─ decode to onchain hex: ${addressToOnchainHex(ltcAddress, 'LTC')}`
  );
  console.log(`BTC address: ${btcAddress}`);
  console.log(
    `\t└─ decode to onchain hex: ${addressToOnchainHex(btcAddress, 'BTC')}`
  );
  console.log(`Email: ${email}`);
  console.log(`Content: ${content}`);
}
