// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from "next/link"
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"
import { Text, Button } from '@chakra-ui/react'

import { useState, useEffect} from 'react'
import {ethers} from "ethers"

import SetOwnerResolver from "components/SetOwnerResolver"
import ReadENS from "components/ReadENS"

import Image from 'next/image'
import OffchainResolverPic from 'images/offchainresolver.png'

declare let window:any

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()

  useEffect(() => {
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    //client side code
    if(!window.ethereum) return
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    })
    provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    })

  },[currentAccount])

  const onClickConnect = () => {
    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    /*
    //change from window.ethereum.enable() which is deprecated
    //see docs: https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts:any)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch('error',console.error)
    */

    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch((e)=>console.log(e))
  }

  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  const isDomainOwner = currentAccount ==="0x3b7d34d0e7e807a9d7ad74f094c5379aca61460d"

  return (
    <>
      <Head>
        <title>My DAPP</title>
      </Head>

      <Heading as="h3"  my={4}>Explore Web3</Heading>          
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
          ?<Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Account info</Heading>
          <Text color={isDomainOwner ? "black" : "red"}>Account address: {currentAccount} {isDomainOwner
              ? "(*.token.eth owner)"
              : "(NOT *.token.eth owner)"}</Text>
          <Text>ETH Balance of current account: {balance}</Text>
          <Text>Chain ID: {chainId}</Text>
          <Text>Chain Name: ChainId {chainname}</Text>
        </Box>
        :<></>
        }

        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Set Main Domain Owner</Heading>
          <SetOwnerResolver 
            currentAccount={currentAccount}
          />
        </Box>

        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Resolve Domain Name</Heading>
          <ReadENS 
            currentAccount={currentAccount}
          />
        </Box>

        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4} fontSize='xl'>Offchain-Resolver Flow</Heading>
          <Image src={OffchainResolverPic} alt="Offchain-Resolver flow" />
        </Box>

        <LinkBox  my={4} p={4} w='100%' borderWidth="1px" borderRadius="lg">
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

export default Home