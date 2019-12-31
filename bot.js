// System Variables
const dotenv = require('dotenv');
dotenv.config();

// Discord.js-commando
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const discordClient = new CommandoClient({
  commandPrefix: '$v',
  owner: process.env.OWNER_DISCORD_ID,
  invite: 'https://discord.gg/DyQjte'
});

discordClient.registry
  .registerDefaultTypes()
  .registerGroups([
    ['docs', 'Commands for Fetching External Programming Documentation'],
    ['leaderboard', 'Commands for Leaderboard'],
    ['util', 'Utility Commands']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));

discordClient.once('ready', () => {
  console.log(
    `Logged in as ${discordClient.user.tag} (${discordClient.user.id})`
  );
  discordClient.user.setActivity('Visual Studio Code');
});

// discordClient.on('message', message => {
//   console.log(`message: ${message.content} userid:${message.member.user.id}`);
// });

discordClient.on('error', console.error);

discordClient.login(process.env.VALKYRIE_TOKEN);
