import { getConcreteApi } from "@concrete-xyz/sdk";

const api = getConcreteApi();

const data = await api.apy.getAllVaultsApy().toPromise();

console.dir(data, { depth: null });