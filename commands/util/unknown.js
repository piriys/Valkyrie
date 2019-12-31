const { Command } = require('discord.js-commando');

module.exports = class UnknownCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'unknown-command',
      group: 'util',
      memberName: 'unknown-command',
      description: 'Reply when an unknown command is used',
      unknown: true,
      hidden: true
    });
  }

  run(message) {}
};
