// 1. Formatting function

function formatTVL(number) {
    if (number >= 1_000_000) {
        return "$" + (number / 1_000_000).toFixed(1) + "M";
    } else if (number >= 1_000) {
        return "$" + (number / 1_000).toFixed(1) + "K";
    } else {
        return "$" + number;
    }
}

function formatAPY(number) {
    return number === null ? "N/A" : number.toFixed(2) + "%";
}

function parseAPY(value) {
    const rawApy = Number(value);
    const apyIsUnavailable =
        value === null ||
        value === undefined ||
        !Number.isFinite(rawApy) ||
        rawApy <= -1;

    return apyIsUnavailable ? null : rawApy * 100;
}


// 2. Array of vaults

let vaults = [];
let vaultsLoading = false;
let vaultsError = null;
let vaultsVisible = false;
let displayedVaults = [];
let selectedVault = null;

const viewVaultButton = document.getElementById("viewVaultButton");
const retryVaultButton = document.getElementById("retryVaultButton");
const vaultDataStatus = document.getElementById("vaultDataStatus");
const vaultStatusTop = document.getElementById("vaultStatusTop");
const vaultStatusBottom = document.getElementById("vaultStatusBottom");
const vaultInfo = document.getElementById("vaultInfo");
const vaultDetails = document.getElementById("vaultDetails");
const vaultDetailsContent = document.getElementById("vaultDetailsContent");
const closeVaultDetails = document.getElementById("closeVaultDetails");
const vaultView = document.getElementById("vaultView");
const vaultSearch = document.getElementById("vaultSearch");
const chainFilter = document.getElementById("chainFilter");
const vaultSort = document.getElementById("vaultSort");
const vaultControls = [vaultView, vaultSearch, chainFilter, vaultSort];
const chainNames = {
    1: "Ethereum",
    988: "Stable",
    2818: "Morph",
    8453: "Base",
    42161: "Arbitrum",
    80094: "Berachain",
    747474: "Katana"
};
const featuredVaultIds = [
    "1:0x0e609b710da5e0aa476224b6c0e5445ccc21251e",
    "1:0xf72bd5a56de97840f1fdd3641b556126c10aa1c4",
    "1:0xe72d4cc29285e33a1bd3f2a5e433256378ebfb88",
    "1:0x86a95dc16d05c62a6c22fa1697ca933ecca380b7"
];

function getVaultId(vault) {
    return `${Number(vault.chainId)}:${vault.address.toLowerCase()}`;
}

function getFeaturedPosition(vault) {
    return featuredVaultIds.indexOf(getVaultId(vault));
}

function isFeaturedVault(vault) {
    return getFeaturedPosition(vault) !== -1;
}

function populateChainFilter() {
    const chainIds = [...new Set(vaults.map(vault => vault.chainId))]
        .sort((a, b) => a - b);

    chainFilter.innerHTML = '<option value="all">All chains</option>';

    for (const chainId of chainIds) {
        const chainName = chainNames[chainId] || "Chain";
        chainFilter.innerHTML +=
            `<option value="${chainId}">${chainName} (${chainId})</option>`;
    }
}

function isActiveByDataSignals(vault) {
    const hasTestMarker = /(^|[^a-z])test([^a-z]|$)/i.test(
        `${vault.name} ${vault.symbol}`
    );

    return vault.tvl > 0 && vault.apy !== null && !hasTestMarker;
}

function hideVaultDetails() {
    vaultDetails.hidden = true;
    vaultDetailsContent.innerHTML = "";
}

function setVaultStatus(text, position) {
    const statusContainer = position === "bottom"
        ? vaultStatusBottom
        : vaultStatusTop;

    statusContainer.appendChild(vaultDataStatus);
    vaultDataStatus.textContent = text;
}

function showVaultDetails(chainId, address) {
    const vault = vaults.find(item =>
        String(item.chainId) === String(chainId) && item.address === address
    );

    if (!vault) {
        return;
    }

    const chainName = chainNames[vault.chainId] || "Chain";
    let html = "<h2>" + vault.name + "</h2>";

    html += "<p><strong>Asset:</strong> " + vault.asset + "</p>";
    html += "<p><strong>Chain:</strong> " + chainName +
        " (" + vault.chainId + ")</p>";
    html += "<p><strong>Vault address:</strong> " + vault.address + "</p>";
    html += "<p><strong>TVL:</strong> " + formatTVL(vault.tvl) + "</p>";
    html += "<p><strong>APY:</strong> " + formatAPY(vault.apy) + "</p>";
    html += "<p><strong>Symbol:</strong> " + vault.symbol + "</p>";
    html += "<p><strong>7-day APY:</strong> " + formatAPY(vault.apy7Days) + "</p>";
    html += "<p><strong>30-day APY:</strong> " + formatAPY(vault.apy30Days) + "</p>";
    html += "<p><strong>Total depositors:</strong> " +
        vault.totalDepositors.toLocaleString("en-US") + "</p>";

    if (vault.curators.length > 0) {
        html += "<p><strong>Curator:</strong> " + vault.curators.join(", ") + "</p>";
    }

    if (vault.timestamp) {
        html += "<p><strong>Data updated:</strong> " +
            new Date(vault.timestamp).toLocaleString() + "</p>";
    }

    html += "<p class='vault-description'>Source: Concrete live vault listing</p>";

    vaultDetailsContent.innerHTML = html;
    vaultDetails.hidden = false;
    vaultDetails.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Load real Concrete vaults
async function loadVaults() {
    vaultsLoading = true;
    vaultsError = null;
    vaultsVisible = false;
    displayedVaults = [];
    selectedVault = null;
    hideVaultDetails();
    viewVaultButton.disabled = true;
    retryVaultButton.hidden = true;
    vaultControls.forEach(control => control.disabled = true);
    setVaultStatus("Vault data: Loading...", "top");
    vaultInfo.innerHTML = "<p>Loading vault data...</p>";

    try {
        const response = await fetch("/api/vaults");

        if (!response.ok) {
            throw new Error("Failed to load Concrete vaults");
        }

        const data = await response.json();

        vaults = [];

        // Concrete returns vaults grouped by chain ID
        for (const chainId in data) {
            const chainVaults = data[chainId];

            for (const address in chainVaults) {
                const v = chainVaults[address];

                vaults.push({
                    name: v.name,
                    symbol: v.symbol || "",
                    asset: v.underlyingToken?.symbol || "Unknown",
                    tvl: Number(v.tvl) || 0,
                    apy: parseAPY(v.apy),
                    apy7Days: parseAPY(v.apy7Days),
                    apy30Days: parseAPY(v.apy30Days),
                    totalDepositors: Number(v.totalDepositors) || 0,
                    curators: Array.isArray(v.curators)
                        ? v.curators.map(curator => curator.name).filter(Boolean)
                        : [],
                    timestamp: v.timestamp || null,
                    description: `${v.symbol} vault on chain ${chainId}`,
                    address: v.address,
                    chainId: v.chainId
                });
            }
        }

        populateChainFilter();
        const activeVaultCount = vaults.filter(isActiveByDataSignals).length;
        setVaultStatus(
            `Vault data: Live (${vaults.length} total; ` +
            `${activeVaultCount} active by data signals)`,
            "bottom"
        );
        vaultsVisible = true;
        displayVaults();
        console.log("Loaded Concrete vaults:", vaults);

    } catch (error) {
        vaults = [];
        vaultsError = error;
        setVaultStatus("Vault data: Error", "top");
        vaultInfo.innerHTML = "<p>Could not load Concrete vault data. Please try again.</p>";
        viewVaultButton.disabled = true;
        retryVaultButton.hidden = false;
        console.error("Error loading Concrete vaults:", error);
    } finally {
        vaultsLoading = false;
        vaultControls.forEach(control => control.disabled = vaultsError !== null);
    }
}


// 3. Function that displays all vaults

function displayVaults() {
    const searchText = vaultSearch.value.trim().toLowerCase();
    const selectedChain = chainFilter.value;
    const selectedSort = vaultSort.value;
    const showingActiveVaults = vaultView.value === "active";

    const selectedVaults = showingActiveVaults
        ? vaults.filter(isActiveByDataSignals)
        : vaults;

    displayedVaults = selectedVaults.filter(vault => {
        const matchesSearch =
            vault.name.toLowerCase().includes(searchText) ||
            vault.asset.toLowerCase().includes(searchText);
        const matchesChain =
            selectedChain === "all" || String(vault.chainId) === selectedChain;

        return matchesSearch && matchesChain;
    });

    if (showingActiveVaults && selectedSort === "default") {
        displayedVaults.sort((a, b) => {
            const aPosition = getFeaturedPosition(a);
            const bPosition = getFeaturedPosition(b);

            if (aPosition === -1 && bPosition === -1) return 0;
            if (aPosition === -1) return 1;
            if (bPosition === -1) return -1;

            return aPosition - bPosition;
        });
    } else if (selectedSort === "tvl-desc") {
        displayedVaults.sort((a, b) => b.tvl - a.tvl);
    } else if (selectedSort === "tvl-asc") {
        displayedVaults.sort((a, b) => a.tvl - b.tvl);
    } else if (selectedSort === "apy-desc" || selectedSort === "apy-asc") {
        displayedVaults.sort((a, b) => {
            if (a.apy === null) return 1;
            if (b.apy === null) return -1;

            return selectedSort === "apy-desc" ? b.apy - a.apy : a.apy - b.apy;
        });
    }

    if (displayedVaults.length === 0) {
        selectedVault = null;
        viewVaultButton.disabled = true;
        vaultInfo.innerHTML = "<p>No vaults match your search and filters.</p>";
        return;
    }

    if (!displayedVaults.includes(selectedVault)) {
        selectedVault = null;
    }

    viewVaultButton.disabled = false;

    let totalTVL = 0;
    let html = "";

    for (let i = 0; i < displayedVaults.length; i++) {
        const v = displayedVaults[i];
        const chainName = chainNames[v.chainId] || `Chain ${v.chainId}`;

        totalTVL += v.tvl;

        html += "<div class='vault-card' role='button' tabindex='0' " +
            "data-chain-id='" + v.chainId + "' data-address='" + v.address + "'>";
        html += "<div class='vault-card__header'><div>";
        html += "<p class='vault-card__symbol'>" + v.symbol + "</p>";
        html += "<h3>" + v.name + "</h3></div>";
        if (isFeaturedVault(v)) html += "<span class='featured-label'>Featured</span>";
        html += "</div>";
        html += "<div class='vault-card__metrics'>";
        html += "<div><span>Asset</span><strong>" + v.asset + "</strong></div>";
        html += "<div><span>TVL</span><strong>" + formatTVL(v.tvl) + "</strong></div>";
        html += "<div><span>APY</span><strong class='apy-value'>" + formatAPY(v.apy) + "</strong></div>";
        html += "<div><span>Network</span><strong>" + chainName + "</strong></div>";
        html += "</div>";
        html += "<p class='vault-description'>View vault details <span aria-hidden='true'>→</span></p>";
        html += "</div>";
    }

    html =
        "<p class='vault-summary'><strong>" +
        (showingActiveVaults ? "Active vaults" : "All vaults") +
        ":</strong> Total TVL " +
        formatTVL(totalTVL) +
        " across " +
        displayedVaults.length +
        " vaults</p>" +
        html;

    vaultInfo.innerHTML = html;
}


// 4. Search, selection, and vault details

vaultControls.forEach(control => {
    control.addEventListener("input", function () {
        if (vaultsVisible) {
            displayVaults();
        }
    });
});

vaultInfo.addEventListener("click", function (event) {
    const card = event.target.closest(".vault-card");

    if (card) {
        selectedVault = vaults.find(vault =>
            String(vault.chainId) === card.dataset.chainId &&
            vault.address === card.dataset.address
        );
        showVaultDetails(card.dataset.chainId, card.dataset.address);
    }
});

vaultInfo.addEventListener("keydown", function (event) {
    const card = event.target.closest(".vault-card");

    if (card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        selectedVault = vaults.find(vault =>
            String(vault.chainId) === card.dataset.chainId &&
            vault.address === card.dataset.address
        );
        showVaultDetails(card.dataset.chainId, card.dataset.address);
    }
});

viewVaultButton.addEventListener("click", function () {
    const vaultToShow = selectedVault || displayedVaults[0];

    if (vaultToShow) {
        selectedVault = vaultToShow;
        showVaultDetails(vaultToShow.chainId, vaultToShow.address);
    }
});

retryVaultButton.addEventListener("click", loadVaults);
closeVaultDetails.addEventListener("click", hideVaultDetails);

loadVaults();
