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
  // Get Metamask account from index page props
  const currentAccount = props.currentAccount;
  // Declare stateful variables and set functions
  const [ensRegistry, setENSRegistry] = useState<string>(
    "0x12315f08329E9727292b055e91A5b4878E264afF"
  );
  const [offchainResolver, setOffchainResolver] = useState<string>("");
  const [gatewayURL, setGatewayURL] = useState<string>("");
  const [domainName, setDomainName] = useState<string>("token.eth");
  const [resolvedData, setResolvedData] = useState<string | null>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Call when offchainResolver changes
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
  }, [offchainResolver]); // Set useEffect func call condition (when offchainResolver changes)

  // Call when resolve button is clicked
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
    const providerWithENS = new ethers.providers.Web3Provider(window.ethereum, {
      chainId: chainDecimal,
      name: chainName,
      ensAddress: ensRegistry,
    });

    // Resolve the specific coin address from domain name
    const domainArray = domainName.split(".");
    // Get first element as coin name
    const coinName = domainArray[0];
    const coinType = getCoinType(coinName)!;
    // Remove first name from domain
    // E.g.: btc.token.eth -> token.eth
    const newDomain = domainArray.slice(1, domainArray.length).join(".");
    let resolved = false;

    // Resolve email from new domain name
    if (isGivenEmail(domainName)) {
      providerWithENS
        .getResolver(newDomain)
        .then((resolver) => {
          // Get OffchainResolver contract address
          setOffchainResolver(resolver!.address);
          // Try to resolve the email from domain name
          resolver!
            .getText("email")
            .then((email) => {
              setResolvedData(email);
              // The email is null when gateway server has no matching domain
              if (email === null) {
                setErrorMessage("[Error] No match data");
              }
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
        })
        .catch((e: Error) => {
          setErrorMessage(e.toString());
        });
      resolved = true;
      console.log("Resolving email completed");
    }

    // Resolve specify coin address from new domain name
    if (isGivenCoin(domainName)) {
      providerWithENS
        .getResolver(newDomain)
        .then((resolver) => {
          // Get OffchainResolver contract address
          setOffchainResolver(resolver!.address);
          // Try to resolve the coin address from domain name
          resolver!
            .getAddress(coinType)
            .then((address) => {
              setResolvedData(address);
              // The coin address is null when gateway server has no matching domain
              if (address === null) {
                setErrorMessage("[Error] No match data");
              }
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
        })
        .catch((e: Error) => {
          setErrorMessage(e.toString());
        });
      resolved = true;
      console.log("Resolving coin address completed");
    }

    // Resolve default ETH address from original domain name
    if (!resolved) {
      providerWithENS
        .getResolver(domainName)
        .then((resolver) => {
          // Get OffchainResolver contract address
          setOffchainResolver(resolver!.address);
          // Try to resolve the ETH address from domain name
          resolver!
            .getAddress()
            .then((address) => {
              setResolvedData(address);
              // The ETH address is null when gateway server has no matching domain
              if (address === null) {
                setErrorMessage("[Error] No match data");
              }
            })
            .catch((e: Error) => {
              setErrorMessage(e.toString());
            });
        })
        .finally(() => {})
        .catch((e: Error) => {
          setErrorMessage(e.toString());
        });
      resolved = true;
      console.log("Resolving default ETH address completed");
    }
  }

  // Return to render the index page
  return (
    <div>
      <form onSubmit={resolver}>
        <FormControl>
          <FormLabel htmlFor="domainname">
            Please Enter A Domain Name Here:
          </FormLabel>
          <Input
            id="domainname"
            type="text"
            required
            onChange={(e) => {
              setErrorMessage("");
              setOffchainResolver("");
              setGatewayURL("");
              // setResolvedData(""); // Keep resolvedData for comparison next resolve
              setDomainName(e.target.value);
            }}
            defaultValue={domainName}
          />
          <FormLabel htmlFor="resolve" color={currentAccount ? "black" : "red"}>
            {currentAccount
              ? "Please Click Here To Resolve:"
              : "Disabled To Resolve! Need Connect To MetaMask First!"}
          </FormLabel>
          <Button type="submit" isDisabled={!currentAccount}>
            Resolve
          </Button>
          <FormLabel htmlFor="offchainresolver">
            OffchainResolver Contract Address (Get From ENSRegistry Contract):
          </FormLabel>
          <Input
            id="offchainresolver"
            type="text"
            value={offchainResolver}
            disabled
          />
          <FormLabel htmlFor="gateway">
            Gateway Server URL (Get From OffchainResolver Contract):
          </FormLabel>
          <Input id="gateway" type="text" value={gatewayURL} disabled />
          <FormLabel htmlFor="resolveddata">Resolved Data:</FormLabel>
          <Input
            id="resolveddata"
            type="text"
            value={
              resolvedData !== null
                ? resolvedData
                : "[Error] No match data (from " + gatewayURL + ")"
            }
            disabled
          />
          <FormLabel
            htmlFor="errormessage"
            color={errorMessage || resolvedData === null ? "red" : "black"}
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

// Determine if the first name in the domain is a name of a email
function isGivenEmail(domain: string): boolean {
  // Try to get the first name in the domain
  const domainArray = domain.split(".");
  if (domainArray.length <= 1) {
    console.log(`[Error] Domain must have at least one dot "."`);
    process.exit(0);
  }
  const firstName = domainArray[0].toUpperCase();
  return firstName === "EMAIL";
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
