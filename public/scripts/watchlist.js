async function loadWatchlist() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const watchlistBody = document.getElementById('watchlist-body');
    watchlistBody.innerHTML = '';

    if (favorites.length === 0) {
        watchlistBody.innerHTML = '<tr><td colspan="3">Keine Favoriten in der Watchlist.</td></tr>';
        return;
    }

    for (let i = 0; i < favorites.length; i++) {
        const coinId = favorites[i];
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`);
        const data = await response.json();
        const coin = data[0];

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
            <td>$${coin.current_price.toFixed(2)}</td>
        `;
        watchlistBody.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', loadWatchlist);
