import 'dotenv/config.js';

import CryptoEngine from './lib/machines/CryptoEngine.js';
import DiscordBot from './lib/machines/DiscordBot.js';
import logger from './lib/utils/logger.js';

const discordToken = process.env.DISCORD_BOT_TOKEN;

if(!discordToken || discordToken === 'XXXXX')
    throw new Error('Please set the environment variable `DISCORD_BOT_TOKEN`');

const cryptoEngine = new CryptoEngine();
const client = new DiscordBot(discordToken);

client.onValidateCryptoCurrency = cryptoCurrency => {
    return cryptoEngine.isTokenValid(cryptoCurrency);
};

client.onRequestCryptoCurrency = cryptoCurrency => {
    return cryptoEngine.getTokenDetails(cryptoCurrency);
};

cryptoEngine.onReady = () => {
    logger.info('Crypto engine has fetched ticker list');
    client.start();
};

process.on('uncaughtException', err => {
    logger.warn('Caught uncaught exception');
    logger.error(err);

    setTimeout(() => {
        process.exit(1);
    }, 0);
});

process.on('unhandledRejection', err => {
    logger.warn('Caught unhandled rejection');
    logger.error(err);

    setTimeout(() => {
        process.exit(1);
    }, 0);
});