import { ethers } from "ethers";
import { getVault } from "@concrete-xyz/sdk";

const mainnetRpcUrl = "https://ethereum-rpc.publicnode.com";
const mainnetProvider = new ethers.JsonRpcProvider(mainnetRpcUrl);

const vault = getVault(
  "v1",
  "0x15cE9bE6609db102b70D68ca75a39c555bEa5Fac",
  "Ethereum",
  mainnetProvider
);

const data = await vault.getVaultDetails();

console.log(data.symbolDetails);
console.log(data);