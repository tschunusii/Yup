
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// CORS-Proxy-Route für CoinGecko, die Anfragen an CoinGecko weiterleitet
app.get('/api/memecoins', async (req, res) => {
    const { page = 1 } = req.query;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=50&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error("Fehler beim Abrufen der CoinGecko-Daten:", error);
        res.status(500).send('Fehler beim Abrufen der Daten');
    }
});


// Route für Top-Gainer, die die Daten von CoinGecko abruft und zurückgibt
app.get('/api/top-gainers', async (req, res) => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h');
        const data = await response.json();

        // Die 12 besten Gewinner auswählen
        const topGainers = data.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 12);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(topGainers);
    } catch (error) {
        console.error("Fehler beim Abrufen der Top-Gainer-Daten:", error);
        res.status(500).send('Fehler beim Abrufen der Top-Gainer-Daten');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
