import Discord from 'discord.js';
import utils from 'lib/utils';

class DiscordBot {
    constructor(token) {
        this._rateLimit = {};

        this._token = token;
        this._client = new Discord.Client();

        this._registerEvents();
    }

    _registerEvents() {
        this._client.on('ready', () => {

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
            react,
            reply,
            content
        } = message;

        const [
            command,
            cryptoCurrency
        ] = content.split(/ +/);

        if(command !== 'c')
            return;

        if(cryptoCurrency.length !== 3)
            return;

        const request = {
            cryptoCurrency: cryptoCurrency.toLowerCase(),
            user,
            channel,
            react,
            reply,
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

        if(!usdPrice) {
            await request.react(':x:');
            await tempMessage.edit(`<@${ request.user.id }> sorry, failed to fetch token stats`);

            return;
        }

        tempMessage.edit([
            `**${ fullCurrencyName.toUpperCase() }**`,
            `» Price: \`$${ usdPrice.toFixedString(2) }\``,
            `» BTC: \`${ btcPrice.dividedBy(8).toFixedString(8) }\``,
            `» Change: \`${ dailyChange.toFixedString(2) }%\``
        ]);
    }

    async _checkRateLimit({ user, react, reply }) {
        if(!(user.id in this._rateLimit))
            return;

        await react(':x:');
        await reply(`<@${ user.id }> you are requesting price details too fast. Please wait a few seconds and try again`);
    }

    async _rateLimitUser(userID) {
        if(userID in this._rateLimit)
            throw new Error(`User ${ userID } is already rate limited`);

        this._rateLimit[ userID ] = setTimeout(() => {
            delete this._rateLimit[ userID ];
        }, 5000);
    }

    async _validateCryptoCurrency({ cryptoCurrency, react, reply, user }) {
        if(!(await this.onValidateCryptoCurrency(cryptoCurrency)))
            return;

        await react(':x:');
        await reply(`<@${ user.id }> please supply a valid cryptocurrency`);

        throw new Error(`Invalid cryptocurrency supplied: ${ utils.truncate(cryptoCurrency, 5) }`);
    }

    async _onPriceRequest(request) {
        const { id: userID } = request.user;

        await this._checkRateLimit(request);
        await this._validateCryptoCurrency(request);
        await this._rateLimitUser(userID);

        await request.react(':white_check_mark:');

        request.reply(`<@${ userID }> now requesting price details. Please check back soon`)
            .then(tempMessage => this._queuePriceRequest({
                request,
                tempMessage
            }));
    }

    start() {
        if(typeof this.onRequestCryptoCurrency === undefined)
            throw new Error('Missing onRequestCryptoCurrency event handler');

        if(typeof this.onValidateCryptoCurrency === undefined)
            throw new Error('Missing onValidateCryptoCurrency event handler');

        this._client.login(this._token);
    }
}

export default DiscordBot;