import React, { useEffect, useState } from "react";
import { Button, Input, FormControl, FormLabel } from "@chakra-ui/react";
import { ethers } from "ethers";
import { Contract } from "ethers";
import { OffchainResolverABI as abi } from "abi/OffchainResolverABI";

interface Props {
  currentAccount: string | undefined;
}

declare let window: any;

export default function ReadENS(props: Props) {
  const currentAccount = props.currentAccount;
  const [ensRegistry, setENSRegistry] = useState<string>(
    "0x12315f08329E9727292b055e91A5b4878E264afF"
  );
  const [offchainResolver, setOffchainResolver] = useState<string>("");
  const [gatewayURL, setGatewayURL] = useState<string>("");
  const [domainName, setDomainName] = useState<string>("token.eth");
  const [resolvedAddress, setResolvedAddress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resolvedEmail, setResolvedEmail] = useState<string>("");

  //call when currentAccount change
  useEffect(() => {
    if (!window.ethereum) return;
    if (!offchainResolver) return;
    setErrorMessage("");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const offResoContract: Contract = new ethers.Contract(
      offchainResolver,
      abi,
      provider
    );
    offResoContract
      .url()
      .then((url: string) => {
        setGatewayURL(url);
      })
      .catch((e: Error) => {
        setErrorMessage(e.toString());
      });
  }, [offchainResolver]);

  async function resolver(event: React.FormEvent) {
    event.preventDefault();
    if (!window.ethereum) return;
    setErrorMessage("");

    // Metamask request methods reference:
    // https://metamask.github.io/api-playground/api-documentation/
    const chainHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainName = getNetworkName(chainHex);
    if (chainName == null) {
      return;
    }
    const chainDecimal = parseInt(chainHex, 16);

    console.log("provider.isMetaMask:", window.ethereum.isMetaMask);

    const providerWithENS = new ethers.providers.Web3Provider(window.ethereum, {
      chainId: chainDecimal,
      name: chainName,
      ensAddress: ensRegistry, // RPC Error when setting ensAddress, but it does not affect DEMO.
    });

    if (isGivenCoin(domainName)) {
      // Resolve the specific coin address from domain name
      const domainArray = domainName.split(".");
      // Get first element as coin name
      const coinName = domainArray[0];
      const coinType = getCoinType(coinName)!;
      // Remove coin name from domain
      // E.g.: btc.token.eth -> token.eth
      const newName = domainArray.slice(1, domainArray.length).join(".");

      providerWithENS
        .getResolver(newName)
        .then((resolver) => {
          // Get OffchainResolver contract address
          setOffchainResolver(resolver!.address);
          // Get specify coin address
          resolver!
            .getAddress(coinType)
            .then((address) => {
              setResolvedAddress(address);
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
          // Get owner email
          resolver!
            .getText("email")
            .then((email) => {
              setResolvedEmail(email);
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
        })
        .catch((e: Error) => {
          setErrorMessage(e.toString());
        });
    } else {
      // Resolve ETH address only from domain name
      providerWithENS
        .getResolver(domainName)
        .then((resolver) => {
          // Get OffchainResolver contract address
          setOffchainResolver(resolver!.address);
          // Get specify coin address
          resolver!
            .getAddress()
            .then((address) => {
              setResolvedAddress(address);
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
          // Get owner email
          resolver!
            .getText("email")
            .then((email) => {
              setResolvedEmail(email);
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
        })
        .catch((e: Error) => {
          setErrorMessage(e.toString());
        });
    }
  }

  return (
    <div>
      <form onSubmit={resolver}>
        <FormControl>
          <FormLabel htmlFor="ensregistry">ENS Address:</FormLabel>
          <Input
            id="ensregistry"
            type="text"
            required
            onChange={(e) => {
              setErrorMessage("");
              setOffchainResolver("");
              setGatewayURL("");
              setResolvedAddress("");
              setENSRegistry(e.target.value);
            }}
            defaultValue={ensRegistry}
          />
          <FormLabel htmlFor="domainname">Domain Name:</FormLabel>
          <Input
            id="domainname"
            type="text"
            required
            onChange={(e) => {
              setErrorMessage("");
              setOffchainResolver("");
              setGatewayURL("");
              setResolvedAddress("");
              setDomainName(e.target.value);
            }}
            defaultValue={domainName}
          />
          <FormLabel htmlFor="resolve" color={currentAccount ? "black" : "red"}>
            {currentAccount
              ? "Click to resolve"
              : "Disabled to resolve! Need connect to Metamask first"}
            :
          </FormLabel>
          <Button type="submit" isDisabled={!currentAccount}>
            Resolve
          </Button>
          <FormLabel htmlFor="offchainresolver">
            OffchainResolver Contract Found from ENSRegistry:
          </FormLabel>
          <Input
            id="offchainresolver"
            type="text"
            value={offchainResolver}
            disabled
          />
          <FormLabel htmlFor="gateway">
            Gateway Server Found from OffchainResolver:
          </FormLabel>
          <Input id="gateway" type="text" value={gatewayURL} disabled />
          <FormLabel htmlFor="resolvedaddress">Resolved Address:</FormLabel>
          <Input
            id="resolvedaddress"
            type="text"
            value={resolvedAddress}
            disabled
          />
          <FormLabel htmlFor="resolvedemail">Resolved Email:</FormLabel>
          <Input
            id="resolvedemail"
            type="text"
            value={resolvedEmail}
            disabled
          />
          <FormLabel
            htmlFor="errormessage"
            color={errorMessage ? "red" : "black"}
          >
            Error Message: {errorMessage}
          </FormLabel>
        </FormControl>
      </form>
    </div>
  );
}

function getNetworkName(chainId: string): string | null {
  let cchainName: string | null = null;
  switch (parseInt(chainId, 16)) {
    case 1: {
      cchainName = "mainnet";
      break;
    }
    case 3: {
      cchainName = "ropsten";
      break;
    }
    case 4: {
      cchainName = "rinkeby";
      break;
    }
    case 5: {
      cchainName = "goerli";
      break;
    }
    case 42: {
      cchainName = "kovan";
      break;
    }
  }
  return cchainName;
}

// Determine if the first name in the domain is a name of a coin
function isGivenCoin(domain: string): boolean {
  // Try to get the first name in the domain
  const domainArray = domain.split(".");
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
    case "ETH": {
      coinType = 60;
      break;
    }
    case "BTC": {
      coinType = 0;
      break;
    }
    case "LTC": {
      coinType = 2;
      break;
    }
  }
  return coinType;
}
