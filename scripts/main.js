let currentPage = 1;
const coinsPerPage = 25;
let coinsData = [];

// Coins aus coins.json laden
async function loadCoins() {
    try {
        const response = await fetch('coins.json');
        if (!response.ok) throw new Error('Fehler beim Laden der Coins-Daten');
        const data = await response.json();
        coinsData = data.sort((a, b) => b.market_cap - a.market_cap); // Nach Marktkapitalisierung sortieren
        displayCoins();
        updatePagination();
    } catch (error) {
        console.error('Fehler:', error);
        alert('Die Coins-Daten konnten nicht geladen werden.');
    }
}

// Coins auf der aktuellen Seite anzeigen
function displayCoins() {
    const start = (currentPage - 1) * coinsPerPage;
    const end = start + coinsPerPage;
    const currentCoins = coinsData.slice(start, end);

    const tableBody = document.getElementById('memecoins-list');
    tableBody.innerHTML = '';

    currentCoins.forEach((coin, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index + 1}</td>
            <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
            <td>$${coin.current_price.toFixed(4)}</td>
            <td>${coin.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Paginierung aktualisieren
function updatePagination() {
    const totalPages = Math.ceil(coinsData.length / coinsPerPage);
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>Vorherige Seite</button>
        <span>Seite ${currentPage} von ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Nächste Seite</button>
    `;
}

// Seite ändern
function changePage(newPage) {
    const totalPages = Math.ceil(coinsData.length / coinsPerPage);
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    displayCoins();
}

// Initialer Aufruf zum Laden der Coins-Daten
document.addEventListener('DOMContentLoaded', () => {
    loadCoins();
});
