// System Variables
const dotenv = require('dotenv');
dotenv.config();

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class AwardsLeaderboardCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'awards',
      group: 'awards',
      memberName: 'awardsleaderboard',
      description: 'View current awards leaderboard',
      throttling: {
        usages: 5,
        duration: 60
      },
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
    const uri = process.env.MONGODB_URI;
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
          .collection('AwardLeaderboard');

        collection
          .find({})
          .sort({ point: -1 })
          .skip(start - 1)
          .limit(count)
          .toArray((findError, findResult) => {
            mongoClient.close();
            if (!findError) {
              console.log('find successful:');
              console.log(findResult);

              if (findResult.length > 0) {
                message.say(
                  `__**Awards Leaderboard from ${start} to ${start +
                    count -
                    1}:**__`
                );

                const reply = findResult.map(
                  (user, index) =>
                    `${start + index}. ${
                      user.displayName ? user.displayName : '(Unknown User)'
                    }: ${user.point} point${user.point > 1 ? 's' : ''}${
                      start + index === 1 ? '🏆' : ''
                    }`
                );
                return message.say(`\`\`\`${reply.join('\n')}\`\`\``);
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
