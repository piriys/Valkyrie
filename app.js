// Discord.js-commando
const { CommandoClient } = require('discord.js-commando');
const Express = require('express');
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

  // Setting up express
  const expressApp = Express();
  const port = process.env.PORT || 80;

  expressApp.set('view engine', 'pug');
  expressApp.set('views', './views');
  expressApp.get('/', (request, response) => {
    response.render('index', {
      title: 'Valkyrie',
      message: 'Index'
    });
  });

  const server = expressApp.listen(port, () =>
    console.log(`expressApp listening on port ${port}!`)
  );

  // // Terminate express/discord.js
  // process.on('uncaughtException', () => {
  //   server.close();
  // });
  // process.on('SIGTERM', () => {
  //   server.close();
  // });
});

discordClient.on('error', console.error);
discordClient.on('message', message => {
  console.log(message.content);
});

discordClient.login(process.env.V_TOKEN);
