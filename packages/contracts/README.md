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
npx hardhat run ./scripts/deploy/ENSRegistry.ts --network goerli
```

- Example output:

```
Deploying ENSRegistry contract...
✔ Expected new contract address : 0x12315f08329E9727292b055e91A5b4878E264afF, is this correct? … yes
ENSRegistry contract address: 0x12315f08329E9727292b055e91A5b4878E264afF

✔ Verify contract on etherscan
cmd : npx hardhat verify --network goerli --contract contracts/ENSRegistry.sol:ENSRegistry 0x12315f08329E9727292b055e91A5b4878E264afF ? … yes
Nothing to compile

Successfully submitted source code for contract
contracts/ENSRegistry.sol:ENSRegistry at 0x12315f08329E9727292b055e91A5b4878E264afF
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ENSRegistry on Etherscan.
https://goerli.etherscan.io/address/0x12315f08329E9727292b055e91A5b4878E264afF#code
```

#### Deploy OffchainResolver contract to Goerli Testnet

```bash
npx hardhat run ./scripts/deploy/OffchainResolver.ts --network goerli
```

- Example output:

```
Deploying OffchainResolver contract...
✔ Expected new contract address : 0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df, is this correct? … yes
OffchainResolver contract address: 0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df

✔ Verify contract on etherscan
cmd : npx hardhat verify --network goerli --contract contracts/OffchainResolver.sol:OffchainResolver 0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df --constructor-args ./scripts/goerli/deployments/OffchainResolverVerifyArguments.ts ? … yes
Nothing to compile

Successfully submitted source code for contract
contracts/OffchainResolver.sol:OffchainResolver at 0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ENSRegistry on Etherscan.
https://goerli.etherscan.io/address/0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df#code
```

#### Set ENSRegistry contract `token.eth` maindomain, and corresponding OffchainResolver contract address

```bash
npx hardhat run ./scripts/operating/OffchainResolver/SetResolver.ts --network goerli
```

- Example output:

```
ENSRegistry contract on etherscan: https://goerli.etherscan.io/address/0x12315f08329E9727292b055e91A5b4878E264afF

OffchainResolver contract on etherscan: https://goerli.etherscan.io/address/0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df

Set ethdomain "eth" owner, TX: https://goerli.etherscan.io/tx/0x3f093c0bd1c6b616c46c72032025af64080dcd193c85e615446e84d9eacee52d

Set maindomain "token" owner, TX: https://goerli.etherscan.io/tx/0x980097bcd976d39ea30cc928e8753d4d74a349f7db5a04c16711096f02b94e9a

Set fulldomain "token.eth" resolver contract, TX: https://goerli.etherscan.io/tx/0xc112ad0ed9497c8f6ee1cf7c966534f16e717d351285cce218f624b97fc5d352
```

#### Get ENSRegistry contract `token.eth` maindomain, and corresponding OffchainResolver contract address

```bash
% npx hardhat run ./scripts/operating/OffchainResolver/GetResolver.ts --network goerli
```

- Example output:

```
ENSRegistry contract on etherscan: https://goerli.etherscan.io/address/0x12315f08329E9727292b055e91A5b4878E264afF

Get ethdomain "eth" owner: 0x3B7D34d0E7e807A9D7aD74F094C5379aca61460D

Get maindomain "token" owner: 0x3B7D34d0E7e807A9D7aD74F094C5379aca61460D

Get fulldomain "token.eth" resolver contract: 0x5376350a1fA3346D50DBA8826C82aEd4Fd8a87df
```
