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
  const name = program.args[0];
  let resolver = await provider.getResolver(name);
  if (resolver) {
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
  } else {
    console.log('no resolver found');
  }
})();

function addressToOnchainHex(address: string, coinType: string): string {
  // Decode to EIP-2304 onchain hex string
  const onchain = formatsByName[coinType].decoder(address);
  return `0x${onchain.toString('hex')}`;
}
