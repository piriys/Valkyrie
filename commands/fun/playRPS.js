//Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class PlayRPSCommand extends Command {
  constructor(discordClient) {
    const rpsRegex = new RegExp(
      `<@!${process.env.V_BOT_ID}>\\s?((rock)|(paper)|(scissors))`,
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
      const rpsStatsUpdate = {
        rps_rock: 0,
        rps_paper: 0,
        rps_scissors: 0,
        rps_win: 0,
        rps_lose: 0,
        rps_draw: 0
      };

      const reply = [];

      userChoices.forEach(userChoice => {
        const botChoice = rps[Math.floor(Math.random() * rps.length)];
        const rpsResult = rpsResults[userChoice][botChoice];
        rpsStatsUpdate[`rps_${rpsResult}`]++;
        rpsStatsUpdate[`rps_${userChoice}`]++;

        reply.push(
          `${botChoice.toUpperCase()}! ${
            rpsResult !== 'draw' ? `YOU ${rpsResult.toUpperCase()}` : 'DRAW'
          }! ${message.author}!`
        );
      });

      message.say(reply.join('\n'));

      const uri = process.env.V_MONGODB_URI;
      const mongoClient = new Mongo.MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      mongoClient.connect(connectError => {
        if (!connectError) {
          console.log('mongo connected');
          const collection = mongoClient
            .db('VALKYRIE')
            .collection('DiscordCollection');
          collection
            .findOneAndUpdate(
              {
                _id: Helpers.getCompositeId(message, message.author.id)
              },
              { $inc: rpsStatsUpdate },
              { upsert: true, returnNewDocument: true }
            )
            .then(result => {
              console.log(result.value);
              message.say(
                Helpers.getCodeBlock(
                  'Currently ' +
                    result.value.displayName +
                    ' has ' +
                    result.value.rps_win +
                    ' win' +
                    Helpers.nounSuffix(result.value.rps_win) +
                    ', ' +
                    result.value.rps_draw +
                    ' draw' +
                    Helpers.nounSuffix(result.value.rps_draw) +
                    ', and ' +
                    result.value.rps_lose +
                    ' loss' +
                    Helpers.nounSuffix(result.value.rps_lose, true) +
                    '!'
                )
              );
            })
            .catch(updateError => {
              console.log(updateError);
              message.say('Failed to send result to server!');
            })
            .finally(() => {
              mongoClient.close();
            });
        }
      });
    } else {
      return message.reply('you are too fast!');
    }
  }
};
