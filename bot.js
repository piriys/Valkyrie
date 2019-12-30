// System Variables
const dotenv = require('dotenv');
dotenv.config();

// Discord.js
const Discord = require('discord.js');
const discordClient = new Discord.Client();
discordClient.login(process.env.VALKYRIE_TOKEN);

// MongoDB
const Mongo = require('mongodb');
const uri = process.env.MONGODB_URI;
const mongoClient = new Mongo.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

discordClient.once('ready', () => {
	console.log('Valkyrie Ready');
	console.log(`botid:${discordClient.user.id}`);
});

discordClient.on('message', (message) => {
	console.log(`message: ${message.content} userid:${message.member.user.id}`);
	if(message.content.startsWith(`<@!${process.env.VALKYRIE_DISCORD_ID}>`)) {
		const messageArray = message.content.split(' ');
		const [botMention, botCommand, ...commandParameters] = messageArray;
		const senderId = message.member.user.id;
		message.channel.send(`<@!${senderId}>`);
		console.log(`command: ${botCommand}`);
		console.log(`parameters: ${commandParameters}`);
		// mongoClient.connect((connectError) => {
		// 	if(!connectError) {
		// 		console.log('mongo connected');
		// 		const collection = mongoClient.db('VALKYRIE').collection('DiscordUsers');
		// 		collection.updateOne(
		// 			{discordId: senderId},
		// 			{ 	
		// 				$set: {
		// 					discordId: senderId,
		// 					displayName: message.member.displayName 
		// 				}
		// 			},
		// 			{upsert: true},
		// 			(updateError) => {
		// 				if(!updateError) {
		// 					console.log('upsert successful');
		// 				} else {
		// 					console.log(updateError.errmsg);
		// 					console.log('upsert failed')
		// 				}
		// 			}
		// 		);
		// 		mongoClient.close();
		// 	} else {
		// 		console.log('connection failed')
		// 	}
		// });			
	}
});

