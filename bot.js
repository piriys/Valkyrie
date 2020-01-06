// Discord.js-commando
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const discordClient = new CommandoClient({
  commandPrefix: '$',
  unknownCommandResponse: false,
  owner: process.env.V_OWNER_ID,
  invite: 'https://discord.gg/DyQjte'
});

discordClient.registry
  .registerDefaultTypes()
  .registerGroups([
    ['docs', 'Commands for Fetching External Programming Documentation'],
    ['awards', 'Commands for awards Leaderboard'],
    ['fun', 'Commands for fun and games'],
    ['util', 'Default and utility commands']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));

discordClient.once('ready', () => {
  console.log(
    `Logged in as ${discordClient.user.tag} (${discordClient.user.id})`
  );
  discordClient.user.setPresence({
    game: { name: 'Visual Studio Code' },
    status: 'online'
  });
});

discordClient.on('error', console.error);

discordClient.login(process.env.V_TOKEN);
