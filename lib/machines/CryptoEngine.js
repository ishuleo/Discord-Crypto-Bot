import CoinGecko from 'coingecko-api';
import logger from '../utils/logger.js';

class CryptoEngine {
    constructor() {
        this._tokenList = {};
        this._tokenCache = {};
        this._requestQueue = new Map();

        this._createClient();
    }

    _createClient() {
        this._client = new CoinGecko();

        this._client.ping()
            .then(() => this._fetchTokenList())
            .catch(() => logger.error('Unable to connect to CoinGecko'));
    }

    async _fetchTokenList() {
        const response = await this._client.coins.list();

        if(!response.success)
            throw new Error('Unable to retrieve token list from CoinGecko');

        response.data.forEach(({ id, symbol, name }) => {
            this._tokenList[ symbol.toLowerCase() ] = id;
            this._tokenList[ name.toLowerCase() ] = id;
        });

        this._onReady();
    }

    _onReady() {
        if(typeof this.onReady !== 'function')
            throw new Error('Missing onReady event handler');

        this.onReady();
    }

    _flushQueue(id, response) {
        this._requestQueue.get(id).forEach(resolve => {
            return resolve(response);
        });

        this._requestQueue.delete(id);

        logger.info(`Flushed request queue for ${ id }`);
    }

    async _queueTokenDetails(id) {
        const { success, data } = await this._client.coins.fetch(id, {
            tickers: false,
            market_data: true, // eslint-disable-line camelcase
            community_data: false, // eslint-disable-line camelcase
            developer_data: false, // eslint-disable-line camelcase
            localization: false,
            sparkline: false
        });

        if(!success) {
            logger.warn('Failed to fetch token details');
            logger.error(data);

            return this._flushQueue(id, { fullCurrencyName: false });
        }

        const dailyChange = data.market_data.price_change_percentage_24h;
        const usdPrice = data.market_data.current_price.usd;
        const btcPrice = data.market_data.current_price.btc;

        const cryptoCurrencyData = {
            fullCurrencyName: data.name,
            dailyChange: dailyChange ? `${ dailyChange.toFixed(2) }%` : 'No daily change',
            usdPrice: usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: usdPrice < 1 ? 8 : 3 }) || 'Unknown',
            btcPrice: btcPrice.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 16 }) || 'Unknown'
        };

        this._tokenCache[ id ] = {
            cryptoCurrencyData,
            timeout: setTimeout(() => {
                delete this._tokenCache[ id ];
            }, 60 * 1000)
        };

        this._flushQueue(id, cryptoCurrencyData);
    }

    getTokenDetails(cryptoCurrency) {
        const id = this._tokenList[ cryptoCurrency ];
        const cachedStats = this._tokenCache[ id ];

        if(cachedStats) {
            logger.info(`Returning cached stats for ${ cryptoCurrency }`);
            return cachedStats.cryptoCurrencyData;
        }

        const isQueued = this._requestQueue.has(id);
        const queue = this._requestQueue.get(id) || [];

        return new Promise(resolve => {
            queue.push(resolve);
            this._requestQueue.set(id, queue);

            if(!isQueued) {
                logger.info(`Created request queue for ${ id }`);
                this._queueTokenDetails(id);
            } else logger.info(`Appended to request queue for ${ id }`);
        });
    }

    isTokenValid(cryptoCurrency) {
        return cryptoCurrency in this._tokenList;
    }
}

export default CryptoEngine;