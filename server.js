import express from "express";
import { getConcreteApi } from "@concrete-xyz/sdk";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("."));

const api = getConcreteApi();

app.get("/api/vaults", async (req, res) => {
    try {
        const data = await api.apy.getAllVaultsApy().toPromise();

        res.json(data);
    } catch (error) {
        console.error("Concrete API error:", error);

        res.status(500).json({
            error: "Failed to load vault data"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Concrete Explorer running at http://localhost:${PORT}`);
});
