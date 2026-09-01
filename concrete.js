import { ethers } from "ethers";
import { getVault } from "@concrete-xyz/sdk";

const NETWORKS = {
  Ethereum: "https://ethereum-rpc.publicnode.com",
  Arbitrum: "https://arb1.arbitrum.io/rpc",
};

export async function getVaultData(
  version,
  address,
  network
) {
  const rpcUrl = NETWORKS[network];

  if (!rpcUrl) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const vault = getVault(
    version,
    address,
    network,
    provider
  );

  const [details, apy] = await Promise.all([
    vault.getVaultDetails(),
    vault.getApyDetails(),
  ]);

  return {
    address: details.address,
    network: details.network,
    version: details.version,
    paused: details.paused,

    symbol: details.vaultAsset.symbol,
    underlyingSymbol: details.underlying.symbol,

    underlying: details.underlying,
    vaultAsset: details.vaultAsset,

    deposits: details.deposits,
    withdrawals: details.withdrawals,

    apy: apy.apy,
    apy7Days: apy.apy7Days,
    apy30Days: apy.apy30Days,

    tvl: apy.tvl,
    totalDepositors: apy.totalDepositors,
    rewardsApy: apy.rewardsApy,

    curators: apy.curators,
  };
}