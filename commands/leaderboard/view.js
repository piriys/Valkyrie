const { Command } = require('discord.js-commando');

module.exports = class ViewLeaderboardCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'leaderboard',
      group: 'leaderboard',
      memberName: 'view',
      description: 'View current leaderboard'
    });
  }

  run(message) {
    message.reply(`Showing current leaderboard`);
  }
};
