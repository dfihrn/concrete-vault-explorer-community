import { getVaultData } from "./concrete.js";

const data = await getVaultData(
  "v1",
  "0x15cE9bE6609db102b70D68ca75a39c555bEa5Fac",
  "Ethereum"
);

console.log(JSON.stringify(data, (_, value) =>
  typeof value === "bigint" ? value.toString() : value,
  2
));