// System Variables
const dotenv = require('dotenv');
dotenv.config();

// Discord.js-commando
const { Command } = require('discord.js-commando');

// MongoDB
const Mongo = require('mongodb');

module.exports = class ViewLeaderboardCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'leaderboard',
      group: 'leaderboard',
      memberName: 'view',
      description: 'View current leaderboard',
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
    message.reply(`Showing current leaderboard:`);
  }
};
