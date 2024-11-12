async function loadWatchlist() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const watchlistBody = document.getElementById('watchlist-body');
    watchlistBody.innerHTML = '';

    if (favorites.length === 0) {
        watchlistBody.innerHTML = '<tr><td colspan="3">Keine Favoriten in der Watchlist.</td></tr>';
        return;
    }

    try {
        // Anfrage an den Server, um alle Favoriten auf einmal abzurufen
        const response = await fetch(`/api/coin/${favorites.join(',')}`);
        const data = await response.json();

        data.forEach((coin, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
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
