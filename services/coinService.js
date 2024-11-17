const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const COINS_CONFIG_PATH = path.resolve(__dirname, '../config/coins.json');

async function fetchCoinData() {
    const coinsConfig = JSON.parse(fs.readFileSync(COINS_CONFIG_PATH, 'utf-8'));
    const coins = coinsConfig.coins.join(',');

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=usd`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
}

module.exports = { fetchCoinData };
