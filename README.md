## Discord Crypto Bot

An easy-to-use, intuitive cryptocurrency price tracking bot for Discord. Built on top of [discord.js](https://github.com/discordjs/discord.js). **NodeJS v13.0.0 or greater is required. This will not change as the project is a personal project and I prefer import statements.**

### Installation
1. Clone the repository
2. Create a new [Discord application](https://discordapp.com/developers/applications). Save the `Client ID`, as this will be used later
3. Create a new bot as part of your Discord application. You can [follow this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) for more information
4. Either:
    - Set your bot token in the `.env` file
    - Remove the `.env` file and set `DISCORD_BOT_TOKEN` to your bot token
5. Run the bot: `yarn start`
    
### Bot permissions
The bot requires these specific permissions:
- Send Messages
- Manage Messages

The permission integer for these specific permissions is `10240`.

### Inviting the bot
You will need to generate an invite link for the bot. To do this, replace `XXXXX` with the `Client ID` you saved earlier.

    https://discordapp.com/oauth2/authorize?client_id=XXXXX&scope=bot&permissions=10240
    
You can now send this invite link to any server owners who are interested in running the bot on their Discord server.