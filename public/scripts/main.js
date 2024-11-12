let currentPage = 1;
const coinsPerPage = 50;
const totalCoins = 5000; // Beispiel für die Gesamtzahl der Coins (anpassen, falls bekannt)
const totalPages = Math.ceil(totalCoins / coinsPerPage);

async function fetchMemeCoins(page = 1) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=${coinsPerPage}&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d`;

    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error("Daten konnten nicht geladen werden.");
        const data = await response.json();

        const filteredData = data.filter(coin => coin.market_cap >= 200000 && coin.market_cap <= 100000000000);

        if (Array.isArray(filteredData)) {
            displayTopMemecoins(filteredData);
            updatePagination(page);
        } else {
            console.error("Ungültige Datenstruktur von API");
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Meme-Coin-Daten:', error);
        alert("Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.");
    }
}

function formatCoinValue(value) {
    if (value >= 0.01) {
        return value.toFixed(2);
    } else {
        return parseFloat(value.toPrecision(4)).toString();
    }
}

// Funktion zur Anzeige der Memecoins
function displayTopMemecoins(coins) {
    const memecoinList = document.getElementById('memecoins-list');
    if (!memecoinList) return;
    memecoinList.innerHTML = '';

    coins.forEach((coin, index) => {
        const row = document.createElement('tr');
        const displayPrice = formatCoinValue(coin.current_price);

        row.innerHTML = `
            <td>${(currentPage - 1) * coinsPerPage + index + 1}</td>
            <td>
                <a href="coin-detail.html?coinId=${coin.id}" style="color: inherit; text-decoration: none;">
                    ${coin.name} (${coin.symbol.toUpperCase()})
                </a>
                <a href="#" class="buy-button">Kaufen</a>
            </td>
            <td>$${displayPrice}</td>
            <td class="${coin.price_change_percentage_1h_in_currency > 0 ? 'coin-gain' : 'coin-loss'}">
                ${coin.price_change_percentage_1h_in_currency?.toFixed(2) ?? 'N/A'}%
            </td>
            <td class="${coin.price_change_percentage_24h > 0 ? 'coin-gain' : 'coin-loss'}">
                ${coin.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%
            </td>
            <td class="${coin.price_change_percentage_7d_in_currency > 0 ? 'coin-gain' : 'coin-loss'}">
                ${coin.price_change_percentage_7d_in_currency?.toFixed(2) ?? 'N/A'}%
            </td>
            <td>$${coin.total_volume?.toLocaleString() ?? 'N/A'}</td>
            <td>$${coin.market_cap?.toLocaleString() ?? 'N/A'}</td>
        `;
        memecoinList.appendChild(row);
    });
}

// Funktion zur Aktualisierung der Paginierung
function updatePagination(page) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;

    paginationElement.innerHTML = `
        <button onclick="changePage(${page - 1})" ${page <= 1 ? 'disabled' : ''}>Vorherige Seite</button>
        <span>Seite ${page}</span>
        <button onclick="changePage(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>Nächste Seite</button>
    `;
}

// Funktion zur Änderung der Seite
function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    fetchMemeCoins(currentPage);
}

// Initialer Aufruf und automatischer Update-Intervall der Hotlist
if (document.getElementById('memecoins-list')) {
    fetchMemeCoins(currentPage);
}
