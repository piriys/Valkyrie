// System Variables
const dotenv = require('dotenv');
dotenv.config();

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class awardPointCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'awardpoint',
      group: 'leaderboard',
      memberName: 'awardpoint',
      description: 'Add point to a user',
      patterns: [/<@!?(\d+)>\s?(\u{1F36A})/gu],
      defaultHandling: false,
      throttling: {
        usages: 5,
        duration: 60
      }
    });
  }

  run(message) {
    const uri = process.env.MONGODB_URI;
    const mongoClient = new Mongo.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('adding point');
    const messageString = message.content;
    let match = message.patternMatches;
    const userIds = new Set([match[1]]); // Only one increment per id

    while ((match = this.patterns[0].exec(messageString)) !== null) {
      userIds.add(match[1]);
    }

    const users = [];

    userIds.forEach(userId => {
      users.push({ _id: userId, point: 0 });
    });

    mongoClient.connect(connectError => {
      if (!connectError) {
        console.log('mongo connected');
        const collection = mongoClient
          .db('VALKYRIE')
          .collection('AwardLeaderboard');

        const updateBulk = [];
        let hasUndefinedUser = false;
        users.forEach(user => {
          const clientUser = this.client.users.get(user._id);
          console.log('client user:');
          console.log(clientUser);
          if (clientUser) {
            //push only if user is valid
            updateBulk.push({
              updateOne: {
                filter: { _id: user._id },
                update: {
                  $set: { displayName: clientUser.username },
                  $inc: { point: 1 }
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
            `I can't award points to user that's not in this server. Sorry!`
          );
        }

        if (updateBulk.length > 0) {
          collection.bulkWrite(
            updateBulk,
            { ordered: true },
            (bulkWriteError, bulkWriteResult) => {
              if (!bulkWriteError) {
                console.log('bulk write successful:');
                console.log(bulkWriteResult);

                collection
                  .find({ _id: { $in: Array.from(userIds) } })
                  .toArray((findError, findResult) => {
                    if (!findError) {
                      console.log('find successful:');
                      console.log(findResult);

                      const reply = findResult.map(user => {
                        const clientUser = this.client.users.get(user._id);
                        return `${
                          clientUser ? clientUser : '(Unknown User)'
                        } now has ${user.point} point${
                          Number(user.point) > 1 ? 's' : ''
                        }!`;
                      });

                      return message.say(reply.join('\n'));
                    } else {
                      console.log('find failed:');
                      console.log(findError);
                    }
                    mongoClient.close();
                  });
              } else {
                console.log('bulk write error:');
                console.log(bulkWriteError);
                mongoClient.close();
              }
            }
          );
        } else {
          mongoClient.close();
        }
      } else {
        console.log('connection failed:');
        console.log(connectError);
        mongoClient.close();
      }
    });
  }
};
