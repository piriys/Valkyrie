//Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class AddCookieCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'sendcookie',
      group: 'cookie',
      memberName: 'sendcookie',
      description: 'Send a cookie to a user',
      patterns: [/<@!?(\d+)>\s?(\u{1F36A})/gu],
      defaultHandling: false,
      throttling: {
        usages: 5,
        duration: 60
      }
    });
  }

  run(message) {
    if (!message.guild) {
      console.log('pm detected');
      return message.reply('Please send cookie in the server channel!');
    }

    console.log('sending cookie');
    const uri = process.env.V_MONGODB_URI;
    const mongoClient = new Mongo.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    mongoClient.connect(connectError => {
      const messageString = message.content;
      let match = message.patternMatches;
      const userIds = new Set([match[1]]); // Only one increment per id

      while ((match = this.patterns[0].exec(messageString)) !== null) {
        userIds.add(match[1]);
      }
      const users = [];

      userIds.forEach(userId => {
        users.push({
          _id: Helpers.getCompositeId(message, userId),
          userId: userId,
          point: 0
        });
      });

      console.log(users);
      if (!connectError) {
        console.log('mongo connected');
        const collection = mongoClient
          .db('VALKYRIE')
          .collection('DiscordCollection');

        const updateBulk = [];
        let hasUndefinedUser = false;
        let hasSelf = false;

        users.forEach(user => {
          const clientUser = this.client.users.get(user.userId);

          if (clientUser) {
            //push only if user is valid
            updateBulk.push({
              updateOne: {
                filter: {
                  _id: Helpers.getCompositeId(message, clientUser.id)
                },
                update: {
                  $set: {
                    displayName: clientUser.username,
                    serverId: message.guild
                      ? message.guild.id
                      : '(Unknown Server)',
                    userId: clientUser.id
                  },
                  $inc: { cookie: 1, point: 1 }
                },
                upsert: true
              }
            });
          } else {
            hasUndefinedUser = true;
          }
        });

        if (hasUndefinedUser) {
          message.reply(
            `I can't award points to user that's not in this server, sorry!`
          );
        }

        if (hasSelf) {
          message.reply(`You can only earn cookies from other users, sorry!`);
        }

        if (updateBulk.length > 0) {
          collection
            .bulkWrite(updateBulk, { ordered: true })
            .then(bulkWriteResult => {
              collection
                .find({
                  _id: {
                    $in: users.map(user =>
                      Helpers.getCompositeId(message, user.userId)
                    )
                  },
                  serverId:
                    message.channel.type === 'text'
                      ? message.channel.id
                      : '(Unknown Server)'
                })
                .project({ cookie: 1, displayName: 1, userId: 1 })
                .toArray((findError, findResult) => {
                  if (!findError) {
                    console.log('find successful:');
                    console.log(findResult);
                    const reply = findResult.map(user => {
                      const clientUser = this.client.users.get(user.userId);
                      return (
                        (clientUser ? clientUser : '(Unknown User)') +
                        ' now got ' +
                        user.cookie +
                        ' ' +
                        Helpers.pluralize(user.cookie, 'cookie') +
                        '!'
                      );
                    });
                    mongoClient.close();
                    return message.say(reply.join('\n'));
                  } else {
                    console.log('find failed:');
                    console.log(findError);
                  }
                });
            })
            .catch(bulkWriteError => {
              console.log(bulkWriteError);
              message.say('Failed to send result to server!');
            })
            .finally(() => {
              mongoClient.close();
              return;
            });
        } else {
          console.log('nothing to update');
        }
      } else {
        console.log('connection failed:');
        console.log(connectError);
      }
    });
    mongoClient.close();
  }
};
