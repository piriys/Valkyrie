// System Variables
const dotenv = require('dotenv');
dotenv.config();

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class PlayRPSCommand extends Command {
  constructor(discordClient) {
    const rpsRegex = new RegExp(
      `<@!${process.env.BOT_DISCORD_ID}>\\s?((rock)|(paper)|(scissors))`,
      'giu'
    );
    super(discordClient, {
      name: 'playrps',
      group: 'fun',
      memberName: 'playrps',
      description: 'Play a game of rock, paper, and scissors',
      patterns: [rpsRegex],
      defaultHandling: false,
      throttling: {
        usages: 5,
        duration: 60
      }
    });
  }

  run(message) {
    const messageString = message.content;
    let match = message.patternMatches;
    const userChoices = [match[1].toLowerCase()];
    const playLimitPerMessage = 3;
    console.log('playing rock paper scissors');
    while ((match = this.patterns[0].exec(messageString)) !== null) {
      userChoices.push(match[1].toLowerCase());
    }

    if (userChoices.length <= playLimitPerMessage) {
      const rpsResults = {
        rock: { rock: 'draw', paper: 'lose', scissors: 'win' },
        paper: { rock: 'win', paper: 'draw', scissors: 'lose' },
        scissors: { rock: 'lose', paper: 'win', scissors: 'draw' }
      };

      const rps = ['rock', 'paper', 'scissors'];
      const rpsStatsUpdate = [];

      const reply = userChoices.map(userChoice => {
        const botChoice = rps[Math.floor(Math.random() * rps.length)];
        const rpsResult = rpsResults[userChoice][botChoice];
        rpsStatsUpdate.push({ choice: userChoice, result: rpsResult });

        return `${botChoice.toUpperCase()}! ${
          rpsResult !== 'draw' ? `YOU ${rpsResult.toUpperCase()}` : 'DRAW'
        }! ${message.author}!`;
      });

      return message.say(reply.join('\n'));
    } else {
      return message.reply('your hand is too fast!');
    }
  }
};
