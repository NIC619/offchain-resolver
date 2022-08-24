// src/components/header.tsx
import NextLink from "next/link";
import {
  Flex,
  Button,
  useColorModeValue,
  Spacer,
  Heading,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";

const siteTitle = "ENSRegistry DAPP";
export default function Header() {
  return (
    <Flex
      as="header"
      bg={useColorModeValue("gray.100", "gray.900")}
      p={4}
      alignItems="center"
    >
      <LinkBox>
        <NextLink href={"/"} passHref>
          <LinkOverlay>
            <Heading size="md">{siteTitle}</Heading>
          </LinkOverlay>
        </NextLink>
      </LinkBox>
      <Spacer />
      <form action="https://metamask.io/download/" target="_blank">
        <input type="submit" value="MetaMask Required" />
      </form>
    </Flex>
  );
}
