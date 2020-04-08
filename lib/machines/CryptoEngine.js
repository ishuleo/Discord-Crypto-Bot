import CoinGecko from 'coingecko-api';
import logger from '../utils/logger.js';

class CryptoEngine {
    constructor() {
        this._tokenList = {};
        this._tokenCache = {};

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

    async getTokenDetails(cryptoCurrency) {
        const id = this._tokenList[ cryptoCurrency ];
        const cachedStats = this._tokenCache[ id ];

        if(cachedStats) {
            logger.info(`Returning cached stats for ${ cryptoCurrency }`);
            return cachedStats.cryptoCurrencyData;
        }

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

            return { fullCurrencyName: false };
        }

        const dailyChange = data.market_data.price_change_percentage_24h;
        const usdPrice = data.market_data.current_price.usd;
        const btcPrice = data.market_data.current_price.btc;

        const cryptoCurrencyData = {
            fullCurrencyName: data.name,
            dailyChange: dailyChange ? `${ dailyChange.toFixed(2) }%` : 'unknown',
            usdPrice: usdPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'unknown',
            btcPrice: btcPrice.toLocaleString(undefined, { maximumFractionDigits: 8 }) || 'unknown'
        };

        this._tokenCache[ id ] = {
            cryptoCurrencyData,
            timeout: setTimeout(() => {
                delete this._tokenCache[ id ];
            }, 60 * 1000)
        };

        return cryptoCurrencyData;
    }

    isTokenValid(cryptoCurrency) {
        return cryptoCurrency in this._tokenList;
    }
}

export default CryptoEngine;