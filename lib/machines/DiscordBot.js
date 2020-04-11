import Discord from 'discord.js';
import logger from '../utils/logger.js';

class DiscordBot {
    constructor(token) {
        this._rateLimit = {};
        this._clientID = false;

        this._token = token;
        this._client = new Discord.Client();

        this._registerEvents();
    }

    _registerEvents() {
        this._client.on('ready', () => {
            logger.info('Connection established, bot is now online');
            this._clientID = this._client.user.id;
        });

        this._client.on('message', message => {
            this._handleMessage(message);
        });
    }

    _handleMessage(message) {
        const {
            author: user,
            id: messageID,
            channel,
            reply,
            content
        } = message;

        if(!content.startsWith('c '))
            return;

        const command = content.match(/^c\s([\w\s\d]{3,64})$/);

        if(command === null)
            return;

        const cryptoCurrency = command[ 1 ]
            .replace(/\s+/, ' ')
            .toLowerCase();

        const request = {
            cryptoCurrency: cryptoCurrency.toLowerCase(),
            reply: reply.bind(message),
            user,
            channel,
            messageID
        };

        this._onPriceRequest(request);
    }

    async _queuePriceRequest({ request, tempMessage }) {
        const {
            fullCurrencyName,
            usdPrice,
            btcPrice,
            dailyChange
        } = await this.onRequestCryptoCurrency(request.cryptoCurrency);

        if(!fullCurrencyName)
            return tempMessage.edit(`<@${ request.user.id }> failed to fetch token stats`);

        const message = [
            `**${ fullCurrencyName }**`,
            `» Price: \`$${ usdPrice }\``,
            `» BTC: \`${ btcPrice }\``,
            `» Change: \`${ dailyChange }\``
        ];

        if(fullCurrencyName === 'Bitcoin')
            message.splice(2, 1);

        await tempMessage.edit(message);
    }

    _rateLimitUser(userID) {
        this._rateLimit[ userID ] = setTimeout(() => {
            delete this._rateLimit[ userID ];
        }, 500);
    }

    async _onPriceRequest(request) {
        const {
            user,
            reply
        } = request;

        if(user.id in this._rateLimit)
            return reply('you are requesting price details too fast. Please wait a few seconds and try again');

        if(!this.onValidateCryptoCurrency(request.cryptoCurrency))
            return reply('please supply a valid cryptocurrency');

        this._rateLimitUser(user.id);

        reply('now requesting price details. Please check back soon')
            .then(tempMessage => this._queuePriceRequest({
                request,
                tempMessage
            }));
    }

    start() {
        if(typeof this.onRequestCryptoCurrency !== 'function')
            throw new Error('Missing onRequestCryptoCurrency event handler');

        if(typeof this.onValidateCryptoCurrency !== 'function')
            throw new Error('Missing onValidateCryptoCurrency event handler');

        logger.info('Requesting WebSocket connection to Discord');

        this._client
            .login(this._token)
            .catch(err => {
                logger.warn('Failed to establish WebSocket connection:');
                logger.error(err);
            });
    }
}

export default DiscordBot;