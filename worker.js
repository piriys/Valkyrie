// Discord.js-commando
const { CommandoClient } = require('discord.js-commando');
const path = require('path');

// Setting up bot
const discordClient = new CommandoClient({
  commandPrefix: '$',
  unknownCommandResponse: false,
  owner: process.env.V_OWNER_ID,
  invite: 'https://discord.gg/Rv77Uhp'
});

discordClient.registry
  .registerDefaultTypes()
  .registerGroups([
    ['docs', 'Commands for fetching external programming documentation'],
    ['cookie', 'Commands for cookie leaderboard'],
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
discordClient.on('message', message => {
  console.log(message.content);
});

discordClient.login(process.env.V_TOKEN);
