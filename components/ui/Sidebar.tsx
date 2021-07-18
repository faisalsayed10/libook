import Icon from "@chakra-ui/icon";
import { Box, Flex, Text } from "@chakra-ui/layout";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { BiBook, BiBookAlt, BiBookContent } from "react-icons/bi";
import { BsBookmark } from "react-icons/bs";
import { MdLibraryBooks } from "react-icons/md";
import Home from "../icons/Home";
import Search from "../icons/Search";

interface Props {}

const IconProps = {
  boxSize: 5,
  mr: "3",
};

const Sidebar: React.FC<Props> = () => {
  const router = useRouter();
  const ButtonProps = (href: string) => ({
    fontSize: "lg",
    cursor: "pointer",
    mb: "1",
    py: "2",
    pl: "2",
    pr: "6",
    w: "100%",
    _hover: { bgColor: "gray.200", borderRadius: "lg" },
    transitionDuration: "100ms",
    className: router.route === href ? "active__sidebar" : null,
  });

  return (
    <Box pos="relative" w="250px" h="100vh">
      <Box pos="absolute">
        <Flex
          flexDir="column"
          alignItems="start"
          top="20%"
          left="5"
          w="inherit"
          pos="fixed"
        >
          <Link href="/">
            <Text {...ButtonProps("/")}>
              <Home {...IconProps} />
              Home
            </Text>
          </Link>
          <Link href="/search">
            <Text {...ButtonProps("/search")}>
              <Search {...IconProps} />
              Search
            </Text>
          </Link>
          <br />
          <Link href="/genre">
            <Text {...ButtonProps("/genre")}>
              <Icon as={MdLibraryBooks} {...IconProps} />
              Genres
            </Text>
          </Link>
          <Link href="/random">
            <Text {...ButtonProps("/random")}>
              <Icon as={BiBookContent} {...IconProps} />
              Random Book
            </Text>
          </Link>
          <br />
          <Link href="/future">
            <Text {...ButtonProps("/future")}>
              <Icon as={BiBookAlt} {...IconProps} />
              Want To Read
            </Text>
          </Link>
          <Link href="/present">
            <Text {...ButtonProps("/present")}>
              <Icon as={BsBookmark} {...IconProps} />
              Currently Reading
            </Text>
          </Link>
          <Link href="/past">
            <Text {...ButtonProps("/past")}>
              <Icon as={BiBook} {...IconProps} />
              Already Read
            </Text>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};

export default Sidebar;