//Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class AwardsLeaderboardCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'rpsleaderboard',
      group: 'fun',
      memberName: 'rpsleaderboard',
      aliases: ['rps_l'],
      description: 'View current Rock, Paper, Scissors leaderboard',
      //   throttling: {
      //     usages: 5,
      //     duration: 60
      //   },
      args: [
        {
          key: 'start',
          prompt: 'Starting position (> 0)',
          type: 'integer',
          default: 1,
          min: 1
        },
        {
          key: 'count',
          prompt: 'Result count (> 0)',
          type: 'integer',
          default: 10,
          min: 1
        }
      ]
    });
  }

  run(message, { start, count }) {
    if (!message.guild) {
      console.log('pm detected');
      return message.reply('Please check leaderboard in server channel!');
    }

    const uri = process.env.V_MONGODB_URI;
    const mongoClient = new Mongo.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`showing leaderboard from ${start} to ${start + count - 1}`);
    mongoClient.connect(connectError => {
      if (!connectError) {
        console.log('mongo connected');
        const collection = mongoClient
          .db('VALKYRIE')
          .collection('DiscordCollection');

        collection
          .find({
            rps_win: { $exists: true },
            rps_draw: { $exists: true },
            rps_lose: { $exists: true },
            serverId: message.guild ? message.guild.id : '(Unknown Server)'
          })
          .sort({ rps_win: -1 })
          .skip(start - 1)
          .limit(count)
          .project({
            rps_win: 1,
            rps_draw: 1,
            rps_lose: 1,
            rps_rock: 1,
            rps_paper: 1,
            rps_scissors: 1,
            displayName: 1
          })
          .toArray((findError, findResult) => {
            mongoClient.close();
            if (!findError) {
              console.log('find successful:');
              console.log(findResult);

              if (findResult.length > 0) {
                message.say(
                  `__**Top Rock Paper Scissors Players from ${start} to ${start +
                    count -
                    1}:**__`
                );

                const reply = findResult.map(
                  (user, index) =>
                    start +
                    index +
                    '. ' +
                    (user.displayName ? user.displayName : '(Unknown User)') +
                    ': ' +
                    user.rps_win +
                    ' ' +
                    Helpers.pluralize(user.rps_win, 'win') +
                    '/' +
                    user.rps_draw +
                    ' ' +
                    Helpers.pluralize(user.rps_draw, 'draw') +
                    '/' +
                    user.rps_lose +
                    ' ' +
                    Helpers.pluralize(user.rps_lose, 'loss') +
                    ' ' +
                    (start + index === 1 ? '🏆' : '')
                );
                return message.say(Helpers.getCodeBlock(reply.join('\n')));
              } else {
                return message.reply(
                  `No result is found from the specified start (${start})!`
                );
              }
            } else {
              console.log('find failed:');
              console.log(findError);
            }
          });
      } else {
        console.log('connection failed:');
        console.log(connectError);
      }
      mongoClient.close();
    });
  }
};
