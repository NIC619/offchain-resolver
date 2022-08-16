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

  // Try to get the coin name from first element of domain name to resolve
  const domainArray = name.split('.');
  const coinName = domainArray[0]; // Get first element
  if (isCoin(coinName)) {
    // If coin resolution is successful from first element of
    // domain name, change name to the real domain.
    // E.g.: btc.token.eth -> real domain = token.eth
    // But: foo.token.eth -> real domain still = foo.token.eth
    name = domainArray.slice(1, domainArray.length).join('.');
  }

  console.log(`Resolving ${name} domain...`);
  const resolver = await provider.getResolver(name);

  if (!resolver) {
    console.log(`No resolver contract or gatway server found`);
    process.exit(0);
  }

  if (isCoin(coinName)) {
    // Only resolve the specified coin address
    const coinType = getCoinType(coinName)!;
    const coinNameToUpper = coinName.toUpperCase();
    const coinAddress = await resolver.getAddress(coinType);
    console.log(`${coinNameToUpper} address: ${coinAddress}`);
    console.log(
      `\t└─ decode to onchain hex: ${addressToOnchainHex(
        coinAddress,
        coinNameToUpper // Uppercase english required
      )}`
    );
  } else {
    // If coin resolution is fails from domain name,
    // resolve all info
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
})();

function addressToOnchainHex(address: string, coinType: string): string {
  // Decode to EIP-2304 onchain hex string
  const onchain = formatsByName[coinType].decoder(address);
  return `0x${onchain.toString('hex')}`;
}

function isCoin(name: string): boolean {
  const coinType = getCoinType(name);
  return coinType === null ? false : true;
}

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
