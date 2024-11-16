
async function loadWatchlist() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const watchlistBody = document.getElementById('watchlist-body');
    watchlistBody.innerHTML = '';

    if (favorites.length === 0) {
        watchlistBody.innerHTML = '<tr><td colspan="3">Keine Favoriten in der Watchlist.</td></tr>';
        return;
    }

    try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favorites.join(',')}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Daten konnten nicht geladen werden.");
        const data = await response.json();

        data.forEach((coin, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <a href="coin-detail.html?coinId=${coin.id}" style="color: inherit; text-decoration: none;">
                        ${coin.name} (${coin.symbol.toUpperCase()})
                    </a>
                </td>
                <td>$${coin.current_price.toFixed(2)}</td>
            `;
            watchlistBody.appendChild(row);
        });
    } catch (error) {
        console.error('Fehler beim Laden der Watchlist:', error);
        watchlistBody.innerHTML = '<tr><td colspan="3">Fehler beim Laden der Watchlist.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', loadWatchlist);
