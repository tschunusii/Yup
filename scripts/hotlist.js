document.addEventListener("DOMContentLoaded", function () {
    const topList = document.getElementById("top-list");

    function resetAnimation() {
        topList.style.animation = "none"; // Stoppt die Animation
        void topList.offsetWidth; // Erzwingt ein Redraw
        topList.style.animation = "scroll 60s linear infinite"; // Startet die Animation neu
    }

    // Aktualisiert die Animation bei jedem Zyklus
    topList.addEventListener("animationiteration", function () {
        resetAnimation();
    });
});

// Funktion zur Aktualisierung der Hotlist mit Daten aus dem `localStorage`
function updateHotlist() {
    const hotlistElement = document.getElementById('top-list');
    const hotlistData = JSON.parse(localStorage.getItem('topGainers')) || [];

    if (!hotlistElement) return;
    hotlistElement.innerHTML = '';

    hotlistData.forEach((coin) => {
        const listItem = document.createElement('li');
        listItem.classList.add('coin-item');

        const coinLink = document.createElement('a');
        coinLink.href = `coin-detail.html?coinId=${coin.id}`;
        coinLink.style.color = 'inherit';
        coinLink.style.textDecoration = 'none';

        let displayPrice = coin.current_price < 0.01 
            ? coin.current_price.toPrecision(4) 
            : coin.current_price.toFixed(2);

        coinLink.textContent = `${coin.name} - $${displayPrice}`;

        const changeElement = document.createElement('span');
        changeElement.textContent = ` (${coin.price_change_percentage_24h > 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%)`;
        changeElement.classList.add(coin.price_change_percentage_24h > 0 ? 'coin-gain' : 'coin-loss');

        listItem.appendChild(coinLink);
        listItem.appendChild(changeElement);
        hotlistElement.appendChild(listItem);
    });
}

// Initiale Aktualisierung und automatischer Update-Intervall der Hotlist
updateHotlist();
setInterval(updateHotlist, 10000);