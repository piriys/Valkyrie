const { Command } = require('discord.js-commando');

module.exports = class ViewLeaderboardCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'leaderboard',
      group: 'leaderboard',
      memberName: 'view',
      description: 'View current leaderboard',
      args: [
        {
          key: 'start',
          type: 'integer',
          prompt: 'Enter starting position',
          default: 1
        },
        {
          key: 'count',
          type: 'integer',
          prompt: 'Enter number of results',
          default: 10
        }
      ]
    });
  }

  run(message, { start, count }) {
    message.reply(
      `Showing current leaderboard from ${start} to ${start + count - 1}:`
    );
  }
};
