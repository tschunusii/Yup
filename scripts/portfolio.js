let portfolios = JSON.parse(localStorage.getItem("portfolios")) || [];
let selectedPortfolioIndex = null;
let transactionType = "Kauf";
let allCoins = [];

// Format number with thousand separators and decimal
function formatNumber(number) {
    return number.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Fetch coin list from the API
async function fetchCoinList() {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
    allCoins = await response.json();
    renderCoinList(allCoins);
}

// Display filtered coin list
function renderCoinList(coins) {
    const coinSelect = document.getElementById("coin-select");
    coinSelect.innerHTML = coins.slice(0, 100).map(coin => `<option value="${coin.id}">${coin.name}</option>`).join("");
}

// Filter the coin list as user types
function filterCoinList() {
    const query = document.getElementById("coin-search").value.toLowerCase();
    const filteredCoins = allCoins.filter(coin => coin.name.toLowerCase().includes(query));
    renderCoinList(filteredCoins);
}

// Fetch and display current price of selected coin
async function fetchCoinPrice() {
    const coinId = document.getElementById("coin-select").value;
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const priceData = await response.json();
    document.getElementById("price").value = formatNumber(priceData[coinId].usd);
}

// Calculate portfolio summary including total value and gain/loss
function calculatePortfolioSummary() {
    if (selectedPortfolioIndex !== null) {
        const portfolio = portfolios[selectedPortfolioIndex];
        let totalValue = 0;
        let totalCost = 0;

        portfolio.assets.forEach(asset => {
            totalValue += asset.quantity * asset.avgPrice;
            totalCost += asset.quantity * asset.avgPrice;
        });

        const gainLoss = totalValue - totalCost;
        const gainLossPercentage = totalCost > 0 ? ((gainLoss / totalCost) * 100).toFixed(2) : 0;

        document.getElementById("portfolio-total-value").textContent = `$${formatNumber(totalValue)}`;
        document.getElementById("portfolio-gain-loss").textContent = `${gainLoss >= 0 ? "+" : ""}${formatNumber(gainLoss)} - ${gainLossPercentage}%`;
    }
}

// Create a new portfolio
function createPortfolio() {
    const name = prompt("Geben Sie einen Namen für das neue Portfolio ein:");
    if (name) {
        portfolios.push({ name, assets: [], transactions: [] });
        savePortfolios();
        updatePortfolioList();
    }
}

// Update the portfolio list
function updatePortfolioList() {
    const portfolioList = document.getElementById("portfolio-list");
    portfolioList.innerHTML = portfolios.map((portfolio, index) => `
        <div class="portfolio-item" onclick="selectPortfolio(${index})">${portfolio.name}</div>
    `).join("");
    document.getElementById("portfolio-count").textContent = `(${portfolios.length})`;
}

// Select a portfolio and display its data
function selectPortfolio(index) {
    selectedPortfolioIndex = index;
    const portfolio = portfolios[index];
    document.getElementById("portfolio-name").textContent = portfolio.name;
    displayAssets(portfolio.assets);
    displayTransactions(portfolio.transactions);
    calculatePortfolioSummary();
}

// Save portfolios to local storage
function savePortfolios() {
    localStorage.setItem("portfolios", JSON.stringify(portfolios));
}

// Show a specific tab (overview or transactions)
function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
    document.getElementById(tabName).classList.remove("hidden");
    calculatePortfolioSummary();
}

// Open the transaction modal
function openTransactionModal() {
    document.getElementById("modal-backdrop").style.display = "block";
    document.getElementById("transaction-modal").style.display = "block";
}

// Close the transaction modal
function closeTransactionModal() {
    document.getElementById("modal-backdrop").style.display = "none";
    document.getElementById("transaction-modal").style.display = "none";
}

// Set transaction type (Kauf/Verkauf)
function selectTransactionType(type) {
    transactionType = type;
}

// Add a transaction to the portfolio
function addTransaction() {
    const coinName = document.getElementById("coin-select").selectedOptions[0].text;
    const price = parseFloat(document.getElementById("price").value.replace(",", "."));
    const quantity = parseFloat(document.getElementById("quantity").value);

    const transaction = {
        type: transactionType,
        date: new Date().toLocaleString(),
        coinName,
        price,
        quantity,
    };

    const portfolio = portfolios[selectedPortfolioIndex];
    portfolio.transactions.push(transaction);

    const asset = portfolio.assets.find(a => a.name === coinName);

    if (transaction.type === "Kauf") {
        if (asset) {
            asset.avgPrice = ((asset.avgPrice * asset.quantity) + (price * quantity)) / (asset.quantity + quantity);
            asset.quantity += quantity;
        } else {
            portfolio.assets.push({ name: coinName, quantity, avgPrice: price });
        }
    } else if (transaction.type === "Verkauf" && asset) {
        asset.quantity -= quantity;
        if (asset.quantity <= 0) {
            portfolio.assets = portfolio.assets.filter(a => a.name !== coinName);
        }
    }

    savePortfolios();
    displayAssets(portfolio.assets);
    displayTransactions(portfolio.transactions);
    calculatePortfolioSummary();
    closeTransactionModal();
}

// Display assets in the table
function displayAssets(assets) {
    const assetsList = document.getElementById("assets-list");
    assetsList.innerHTML = assets.map(asset => `
        <tr>
            <td>${asset.name}</td>
            <td>${formatNumber(asset.avgPrice)}</td>
            <td>${formatNumber(asset.quantity)}</td>
            <td>${formatNumber(asset.avgPrice)}</td>
            <td>${formatNumber(asset.avgPrice * asset.quantity)}</td>
        </tr>
    `).join("");
}

// Display transactions in the table
function displayTransactions(transactions) {
    const transactionsList = document.getElementById("transactions-list");
    transactionsList.innerHTML = transactions.map(transaction => `
        <tr>
            <td style="color: ${transaction.type === 'Kauf' ? 'green' : 'red'};">${transaction.type}</td>
            <td>${transaction.date}</td>
            <td>${transaction.coinName}</td>
            <td>${formatNumber(transaction.price)}</td>
            <td>${formatNumber(transaction.quantity)}</td>
            <td><button onclick="deleteTransaction('${transaction.coinName}')">Löschen</button></td>
        </tr>
    `).join("");
}

// Initialize portfolio and coin list on page load
document.addEventListener("DOMContentLoaded", () => {
    updatePortfolioList();
    fetchCoinList();
});
