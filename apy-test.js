import { getVault } from "@concrete-xyz/sdk";

const vault = getVault(
  "v1",
  "0xE2d8267D285a7ae1eDf48498fF044241d04e9608",
  "Arbitrum"
);

const data = await vault.getApyDetails();

console.log(data);