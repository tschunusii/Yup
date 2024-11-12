const express = require('express');
const app = express();
const fetch = require('node-fetch'); // Falls node-fetch verwendet wird

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

// Proxy-Route zur Umgehung des CORS-Problems für spezifische Coin-Daten
app.get('/api/coin/:coinId', async (req, res) => {
    const coinId = req.params.coinId;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error("Fehler beim Abrufen der Coin-Daten:", error);
        res.status(500).send('Fehler beim Abrufen der Coin-Daten');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
