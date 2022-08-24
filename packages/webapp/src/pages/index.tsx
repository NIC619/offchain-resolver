import Head from 'next/head'
import NextLink from "next/link"
import type { NextPage } from 'next'
import { useState, useEffect} from 'react'
import { Text, Button } from '@chakra-ui/react'
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"

import {ethers} from "ethers"
import ReadENS from "components/ReadENS"
import OffchainResolverPic from 'images/offchainresolver.png'

declare let window: any

const Home: NextPage = () => {
    // Declare stateful variables and set functions
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [isDomainOwner, setIsDomainOwner]=useState<boolean>(false)
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()
  const [ensRegistry, setENSRegistry] = useState<string>();

  const domainOwner = "0x3b7d34d0e7e807a9d7ad74f094c5379aca61460d"
  const ensRegistryAddress = "0x12315f08329E9727292b055e91A5b4878E264afF"

  // Call when currentAccount changes
  useEffect(() => {
    // Confirm the address obtained from MetaMask
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    // Client side code
    if(!window.ethereum) return

    // To get provider from MetaMask with ensAddress,
    // Get the chainHex from MetaMask first 
    window.ethereum.request({ method: "eth_chainId" })
      .then((chainHex: string)=>{
        // ChainId hex string to number
        const chainIdNum = parseInt(chainHex, 16);
        // Get network name from chainID number
        const chainName = getNetworkName(chainHex);
        if (chainName == null) {
          return;
        }
        // Get provider from MetaMask with ensAddress
        const providerWithENS = new ethers.providers.Web3Provider(window.ethereum, {
          chainId: chainIdNum,
          name: chainName,
          ensAddress: ensRegistryAddress,
        });
        // Sync accounts[0] balance
        providerWithENS.getBalance(currentAccount).then((result)=>{
          setBalance(ethers.utils.formatEther(result))
        });
        // Sync network info 
        providerWithENS.getNetwork().then((result)=>{
          setChainId(result.chainId)
          setChainName(result.name)
          setENSRegistry(result.ensAddress!)
        });
      })
  },[currentAccount]) // Set useEffect func call condition (when currentAccount changes)

  // Connect MetaMask network when button clicked
  const onClickConnect = () => {
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    // Get provider from MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) {
        setCurrentAccount(accounts[0])
        setIsDomainOwner(domainOwner === accounts[0]) // currentAccount isn't ready yet
      }
    })
    .catch((e)=>console.log("[Error]", e.toString()))
  }

  // Disconnect MetaMask network when button clicked again
  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  // Render the Index page
  return (
    <>
      <Head>
        <title>ENS DAPP</title>
      </Head>

      <Heading as="h3" my={4}>Explore ENSRegistry Web3.0</Heading>          
      <VStack>
      <Box w='100%' my={4}>
        {currentAccount  
          ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                Account: {currentAccount}
            </Button>
          : <Button type="button" w='100%' onClick={onClickConnect}>
                  Connect MetaMask
              </Button>
        }
        </Box>

        {currentAccount  
          ?<Box mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Network Information</Heading>
          <Text>Chain ID: {chainId} ({chainname})</Text>
          <Text>ENSRegistry Address: {ensRegistry}</Text>
        </Box>
        :<></>
        }

        <Box mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Resolve Domain Name</Heading>
          <ReadENS 
            currentAccount={currentAccount}
          />
        </Box>

        <Box>
          <Heading>Offchain-Resolver Flow</Heading>
          <img src={OffchainResolverPic.src} />
        </Box>

        <LinkBox my={4} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <NextLink href="https://github.com/NIC619/offchain-resolver" passHref>
          <LinkOverlay>
            <Heading my={4} fontSize='xl'>offchain-resolver repo with link</Heading>
            <Text>Read docs of offchain-resolver repo</Text>
          </LinkOverlay>
          </NextLink>
        </LinkBox>

      </VStack>
    </>
  )
}

// Export Home
export default Home


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