// Request
const request = require('request');

// Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

module.exports = class IdentifyImageCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'identifyimage',
      aliases: ['img_id', 'identify this:', 'analyze this:'],
      group: 'util',
      memberName: 'identifyimage',
      description: 'Identify image',
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'imageUrl',
          prompt: 'Image url',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  run(message, { imageUrl }) {
    console.log(`getting image from [${imageUrl}]`);

    message.reply('one moment please...');

    const uri = `${process.env.V_MCV_ENDPOINT}vision/v2.1/analyze`;

    const params = {
      visualFeatures: 'Objects',
      details: '',
      language: 'en'
    };

    const options = {
      uri: uri,
      qs: params,
      body: `{"url":"${imageUrl}"}`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.V_MCV_KEY
      }
    };

    request.post(options, (error, response, body) => {
      if (error || response.code === 'InvalidImageUrl') {
        console.error(error);
        return message.reply(`I can't find any image in that url :(`);
      }

      const jsonResponse = JSON.parse(body);
      const imageObjects = jsonResponse.objects;

      if (imageObjects.length === 0) {
        return message.reply(`I don't see any object in that image :(`);
      }

      message.reply(
        'thanks for waiting! :thinking: Here is what I see in the image: '
      );

      const objectTexts = imageObjects.map(imageObject =>
        imageObject.object.toLowerCase()
      );

      return message.say(Helpers.getCodeBlock(objectTexts.join('\n')));
    });
  }
};
