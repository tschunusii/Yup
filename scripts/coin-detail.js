// Initialisierung des TradingView-Charts
function initializeTradingViewChart(symbol) {
    new TradingView.widget({
        container_id: "tradingview-chart-container",
        width: "100%",
        height: 600,
        symbol: `BINANCE:${symbol}`,
        interval: "15",
        theme: "dark",
        style: "1",
        locale: "de",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        details: true,
        hotlist: true,
        calendar: true,
        studies: ["MACD@tv-basicstudies", "RSI@tv-basicstudies"],
    });
}

// Coin-Daten laden und initialisieren
async function loadCoinData(coinId) {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
        
        const data = await response.json();

        // Basisinformationen
        document.getElementById("coin-name").textContent = data.name;
        document.getElementById("coin-symbol").textContent = `${data.symbol.toUpperCase()} - Rang #${data.market_cap_rank || 'N/A'}`;
        document.getElementById("coin-logo").src = data.image?.thumb || "../images/default-logo.png";

        // Market Cap
        const marketCap = data.market_data.market_cap.usd || 0;
        const marketCapChange = data.market_data.market_cap_change_percentage_24h || 0;
        document.getElementById("market-cap").innerHTML = `$${(marketCap / 1e12).toFixed(2)}T <span class="${marketCapChange > 0 ? 'positive' : 'negative'}">${marketCapChange.toFixed(2)}%</span>`;

        // Volume (24h)
        const volume24h = data.market_data.total_volume.usd || 0;
        const volumeChange = data.market_data.total_volume_change_percentage_24h || 0;
        document.getElementById("volume-24h").innerHTML = `$${(volume24h / 1e9).toFixed(2)}B <span class="${volumeChange > 0 ? 'positive' : 'negative'}">${volumeChange.toFixed(2)}%</span>`;

        // FDV (Fully Diluted Valuation)
        const fdv = data.market_data.fully_diluted_valuation.usd || 0;
        document.getElementById("fdv").textContent = `$${(fdv / 1e12).toFixed(2)}T`;

        // Vol/Mkt Cap (24h)
        const volMktCap = volume24h && marketCap ? (volume24h / marketCap * 100).toFixed(2) : 'N/A';
        document.getElementById("vol-mkt-cap").textContent = `${volMktCap}%`;

        // Total Supply
        const totalSupply = data.market_data.circulating_supply || 0;
        document.getElementById("total-supply").textContent = `${totalSupply.toFixed(2)} ${data.symbol.toUpperCase()}`;

        // Max Supply - wenn nicht vorhanden, leer lassen
        const maxSupply = data.market_data.max_supply;
        document.getElementById("max-supply").textContent = maxSupply ? `${maxSupply.toFixed(2)} ${data.symbol.toUpperCase()}` : '';
        
        // TradingView-Chart initialisieren
        initializeTradingViewChart(data.symbol.toUpperCase() + 'USDT');
        startWebSocket(data.symbol.toLowerCase() + 'usdt');
    } catch (error) {
        console.error("Fehler beim Abrufen der Coin-Daten:", error);
        alert("Fehler beim Laden der Coin-Daten. Bitte versuchen Sie es später erneut.");
    }
}


// WebSocket für Echtzeit-Handelsdaten starten
function startWebSocket(symbol) {
    const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

    socket.onmessage = (event) => {
        const trade = JSON.parse(event.data);
        updateTradeTable(trade);
    };

    socket.onclose = () => {
        console.log("WebSocket-Verbindung geschlossen. Versuche erneut zu verbinden...");
        setTimeout(() => startWebSocket(symbol), 1000);
    };
}

// Handelsdaten in der Tabelle anzeigen
function updateTradeTable(trade) {
    const tradeTableBody = document.getElementById("trade-data");
    const price = trade.p < 0.01 ? parseFloat(trade.p).toFixed(10) : parseFloat(trade.p).toFixed(4);
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${new Date(trade.T).toLocaleTimeString()}</td>
        <td class="${trade.m ? "trade-sell" : "trade-buy"}">${trade.m ? "Verkauf" : "Kauf"}</td>
        <td>${parseFloat(trade.q).toFixed(4)}</td>
        <td>$${price}</td>
    `;
    tradeTableBody.prepend(row);
    if (tradeTableBody.rows.length > 20) {
        tradeTableBody.deleteRow(-1);
    }
}

// Beispielaufruf für die Initialisierung
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get("coinId");
    if (coinId) {
        loadCoinData(coinId);
    } else {
        alert("Kein Coin angegeben.");
    }
});
