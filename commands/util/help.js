//Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

module.exports = class AddCookieCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'help',
      aliases: ['h'],
      group: 'util',
      memberName: 'help',
      description: 'Shows a list of commands',
      throttling: {
        usages: 5,
        duration: 60
      }
    });
  }

  run(message) {
    return message.reply(Helpers.getHelpMessage());
  }
};
