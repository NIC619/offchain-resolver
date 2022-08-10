# ENS Offchain Resolver Contracts

This package contains Solidity contracts you can customise and deploy to provide offchain resolution of ENS names.

These contracts implement [ENSIP 10](https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution) (wildcard resolution support) and [EIP 3668](https://eips.ethereum.org/EIPS/eip-3668) (CCIP Read). Together this means that the resolver contract can be very straightforward; it simply needs to respond to all resolution requests with a redirect to your gateway, and verify gateway responses by checking the signature on the returned message.

These contracts can also be used as a starting point for other verification methods, such as allowing the owner of the name to sign the records themselves, or relying on another verification mechanism such as a merkle tree or an L2 such as Optimism. To do so, start by replacing the calls to `SignatureVerifier` in `OffchainResolver` with your own solution.

## Contracts

### [IExtendedResolver.sol](contracts/IExtendedResolver.sol)

This is the interface for wildcard resolution specified in ENSIP 10. In time this will likely be moved to the [@ensdomains/ens-contracts](https://github.com/ensdomains/ens-contracts) repository.

### [SignatureVerifier.sol](contracts/SignatureVerifier.sol)

This library facilitates checking signatures over CCIP read responses.

### [OffchainResolver.sol](contracts/OffchainResolver.sol)

This contract implements the offchain resolution system. Set this contract as the resolver for a name, and that name and all its subdomains that are not present in the ENS registry will be resolved via the provided gateway by supported clients.

### Quick start

#### Setup environment

```bash
yarn install && yarn build
```

#### Deploy ENSRegistry contract to Goerli Testnet

```bash
cd ./packages/contracts
npx hardhat run ./scripts/deploy/00_ENSRegistry.ts --network goerli
```

- Example output:

```
Deploying ENSRegistry contract...
✔ Expected new contract address : 0xCAff8bDd1a730359C63Db8240e63184504C60B24, is this correct? … yes
ENSRegistry contract address: 0xCAff8bDd1a730359C63Db8240e63184504C60B24

✔ Verify contract on etherscan
cmd : npx hardhat verify --network goerli --contract contracts/ENSRegistry.sol:ENSRegistry 0xCAff8bDd1a730359C63Db8240e63184504C60B24 ? … yes
Nothing to compile

Successfully submitted source code for contract
contracts/ENSRegistry.sol:ENSRegistry at 0xCAff8bDd1a730359C63Db8240e63184504C60B24
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ENSRegistry on Etherscan.
https://goerli.etherscan.io/address/0xCAff8bDd1a730359C63Db8240e63184504C60B24#code
```

#### Deploy OffchainResolver contract to Goerli Testnet

```bash
npx hardhat run ./scripts/deploy/10_OffchainResolver.ts --network goerli
```

- Example output:

```
Deploying OffchainResolver contract...
✔ Expected new contract address : 0x76e099f303E23FD5A362563B955715aaADCf504F, is this correct? … yes
OffchainResolver contract address: 0x76e099f303E23FD5A362563B955715aaADCf504F

✔ Verify contract on etherscan
cmd : npx hardhat verify --network goerli --contract contracts/OffchainResolver.sol:OffchainResolver 0x76e099f303E23FD5A362563B955715aaADCf504F --constructor-args ./scripts/goerli/deployments/10_OffchainResolverVerifyArguments.ts ? … yes
Nothing to compile

Successfully submitted source code for contract
contracts/OffchainResolver.sol:OffchainResolver at 0x76e099f303E23FD5A362563B955715aaADCf504F
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ENSRegistry on Etherscan.
https://goerli.etherscan.io/address/0x76e099f303E23FD5A362563B955715aaADCf504F#code
```

#### Set ENSRegistry contract `token.eth` maindomain, and corresponding OffchainResolver contract address

```bash
npx hardhat run ./scripts/operating/OffchainResolver/00_SetResolver.ts --network goerli
```

- Example output:

```
ENSRegistry contract on etherscan: https://goerli.etherscan.io/address/0xCAff8bDd1a730359C63Db8240e63184504C60B24

OffchainResolver contract on etherscan: https://goerli.etherscan.io/address/0x76e099f303E23FD5A362563B955715aaADCf504F

Set maindomain "token" owner TX: https://goerli.etherscan.io/tx/0x836a8b219b7583b495315b6299a1d50aff80793f32d95ee356d9489976f3c1bb

Set fulldomain "token.eth" resolver TX: https://goerli.etherscan.io/tx/0x5eb3f5bb9c7b9e3499737fab5c2fb171e0730c7d84cacb1aa40ec60c16e87bad
```

#### Get ENSRegistry contract `token.eth` maindomain, and corresponding OffchainResolver contract address

```bash
% npx hardhat run ./scripts/operating/OffchainResolver/01_GetResolver.ts --network goerli
```

- Example output:

```
ENSRegistry contract on etherscan: https://goerli.etherscan.io/address/0xCAff8bDd1a730359C63Db8240e63184504C60B24

Get maindomain "token" Owner: 0x3B7D34d0E7e807A9D7aD74F094C5379aca61460D

Get fulldomain "token.eth" Resolver: 0x76e099f303E23FD5A362563B955715aaADCf504F
```
