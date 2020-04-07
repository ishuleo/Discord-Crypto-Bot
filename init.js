import 'dotenv/config.js';

import CryptoEngine from 'lib/CryptoEngine';
import DiscordBot from 'lib/DiscordBot';

const discordToken = process.env.DISCORD_BOT_TOKEN;

if(!discordToken)
    throw new Error('Please set the environment variable `DISCORD_BOT_TOKEN`');

const cryptoEngine = new CryptoEngine();
const client = new DiscordBot(discordToken);

client.onValidateCryptoCurrency = async cryptoCurrency => {
    // Validate currency with engine, return boolean
};

client.onRequestCryptoCurrency = async cryptoCurrency => {
    // await cryptoEngine.getTokenDetails(cryptoCurrency)

    // The above is added to a queue with timestamp rounded to the minute.
    // When a crypto currency resolves for that minute, reply to all queued
    // requests for that currency in the same minute

    // const hash = `${ cryptoCurrency }:${ currentMinute }`
    // requests[hash] = requests[hash] || []
    // requests[hash].push(requestID)

    // requests[requestID].reply({ fullCurrencyName, usdPrice, btcPrice, dailyChange });
    // requests[requestID].error();

    // return { usdPrice, btcPrice, dailyChange }
};

client.start();