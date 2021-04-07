import CoinGecko from 'coingecko-api';
import Binance from 'node-binance-api';
import logger from '../utils/logger.js';

CoinGecko.TIMEOUT = 5000;

class CryptoEngine {
    _nameMap = {};
    _tokenList = {};

    _binanceCache = {};
    _coinGeckoCache = {};

    _requestQueue = new Map();

    constructor() {
        Promise.all([
            this._createCoinGeckoClient(),
            this._createBinanceClient()
        ]).then(() => this._onReady());
    }

    _createCoinGeckoClient() {
        this._coinGecko = new CoinGecko();

        return this._coinGecko.coins
            .list()
            .then(({ success, data }) => {
                if(!success)
                    throw new Error('Unable to retrieve token list from CoinGecko');

                data.forEach(({ id, symbol, name }) => {
                    this._tokenList[ symbol.toLowerCase() ] = {
                        name,
                        id
                    };

                    this._nameMap[ name.toLowerCase() ] = symbol.toLowerCase();
                });

                logger.info(`Successfully connected to CoinGecko, tracking ${ data.length } symbols`);
            })
            .catch(() => logger.error('Unable to connect to CoinGecko'));
    }

    _createBinanceClient() {
        this._binance = new Binance();

        this._binance.websockets
            .miniTicker(markets => {
                for(const ticker in markets) {
                    if(!ticker.endsWith('USDT'))
                        continue;

                    const stripped = ticker
                        .substr(0, ticker.length - 4)
                        .toLowerCase();

                    this._binanceCache[ stripped ] = +markets[ ticker ].close;
                }
            });

        return this._binance
            .prices()
            .then(tickers => {
                let count = 0;

                for(const ticker in tickers) {
                    if(!(ticker.endsWith('USDT')))
                        continue;

                    const stripped = ticker
                        .substr(0, ticker.length - 4)
                        .toLowerCase();

                    this._binanceCache[ stripped ] = +tickers[ ticker ];
                    count++;
                }

                logger.info(`Successfully connected to Binance, tracking ${ count } symbols`);
            })
            .catch(() => logger.error('Unable to connect to Binance'));
    }

    _onReady() {
        if(typeof this.onReady !== 'function')
            throw new Error('Missing onReady event handler');

        this.onReady();
    }

    _flushQueue(id, response) {
        this._requestQueue
            .get(id)
            .forEach(resolve => {
                return resolve(response);
            });

        this._requestQueue
            .delete(id);

        logger.info(`Flushed request queue for ${ id }`);
    }

    async _queueTokenDetails(symbol) {
        const { id } = this._tokenList[ symbol ];
        const { success, data } = await this._coinGecko.coins
            .fetch(id, {
                tickers: false,
                market_data: true, // eslint-disable-line camelcase
                community_data: false, // eslint-disable-line camelcase
                developer_data: false, // eslint-disable-line camelcase
                localization: false,
                sparkline: false
            })
            .catch(data => {
                return {
                    success: false,
                    data
                }
            });

        if(!success) {
            logger.warn('Failed to fetch token details');
            logger.error(data);

            return this._flushQueue(id, { fullCurrencyName: false });
        }

        const dailyChange = data.market_data.price_change_percentage_24h;
        const usdPrice = data.market_data.current_price.usd;
        const btcPrice = data.market_data.current_price.btc;

        const binancePrice = (symbol in this._binanceCache) &&
            `${ this._binanceCache[ symbol ].toLocaleString(undefined, {
                maximumFractionDigits: this._binanceCache[ symbol ] < 1 ? 8 : 3,
                minimumFractionDigits: 2,
            }) }*`;

        const cryptoCurrencyData = {
            fullCurrencyName: data.name,
            dailyChange: dailyChange ?
                `${ dailyChange.toFixed(2) }%` :
                'No daily change',
            usdPrice: binancePrice || (usdPrice ?
                usdPrice.toLocaleString(undefined, {
                    maximumFractionDigits: usdPrice < 1 ? 8 : 3,
                    minimumFractionDigits: 2
                }) :
                'Unknown'),
            btcPrice: btcPrice ?
                btcPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 16,
                    minimumFractionDigits: 8
                }) :
                'Unknown'
        };

        this._coinGeckoCache[ id ] = {
            cryptoCurrencyData,
            timeout: setTimeout(() => {
                delete this._coinGeckoCache[ id ];
            }, 60 * 1000)
        };

        this._flushQueue(id, cryptoCurrencyData);
    }

    getTokenDetails(cryptoCurrency) {
        const symbol = this._nameMap[ cryptoCurrency ] || cryptoCurrency;
        const { id } = this._tokenList[ symbol ];
        const cachedStats = (this._coinGeckoCache[ id ] || {}).cryptoCurrencyData;
        const binancePrice = (symbol in this._binanceCache) &&
            `${ this._binanceCache[ symbol ].toLocaleString(undefined, {
                maximumFractionDigits: this._binanceCache[ symbol ] < 1 ? 8 : 3,
                minimumFractionDigits: 2,
            }) }*`;

        if(cachedStats) {
            logger.info(`Returning cached stats for ${ cryptoCurrency }`);

            if(binancePrice)
                cachedStats.usdPrice = binancePrice;

            return cachedStats;
        }

        const isQueued = this._requestQueue.has(id);
        const queue = this._requestQueue.get(id) || [];

        return new Promise(resolve => {
            queue.push(resolve);
            this._requestQueue.set(id, queue);

            if(!isQueued) {
                logger.info(`Created request queue for ${ id }`);
                this._queueTokenDetails(symbol);
            } else logger.info(`Appended to request queue for ${ id }`);
        });
    }

    isTokenValid(cryptoCurrency) {
        return cryptoCurrency in this._nameMap || cryptoCurrency in this._tokenList;
    }
}

export default CryptoEngine;