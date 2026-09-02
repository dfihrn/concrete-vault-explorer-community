import express from "express";
import { getConcreteApi } from "@concrete-xyz/sdk";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(__dirname, "public");

app.get("/", (req, res) => {
    res.sendFile(path.join(publicDirectory, "index.html"));
});

app.use(express.static(publicDirectory));

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
