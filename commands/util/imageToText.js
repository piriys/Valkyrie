// Request
const request = require('request');

// Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

module.exports = class ImageToTextCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'imagetotext',
      aliases: ['img_t', 'transcribe this:'],
      group: 'util',
      memberName: 'imagetotext',
      description: 'Find text from image',
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

    const uri = `${process.env.V_MCV_ENDPOINT}vision/v2.1/ocr`;

    const params = {
      language: 'en',
      detectOrientation: 'true'
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
      if (error) {
        console.error(error);
        return message.reply(`I can't find any image in that url :(`);
      }

      const jsonResponse = JSON.parse(body);
      const regions = jsonResponse.regions;

      if (regions.length === 0) {
        return message.reply(`I don't see any text in that image :(`);
      }

      message.reply(
        'thanks for waiting! :thinking: Here is what I think the image says:'
      );
      const imageText = [];

      regions.forEach(region => {
        const regionText = [];
        const lines = region.lines;
        lines.forEach(line => {
          const lineText = [];
          const words = line.words;
          words.forEach(word => {
            const text = word.text;
            lineText.push(text);
          });
          regionText.push(lineText.join(' '));
        });
        imageText.push(regionText.join('\n'));
      });

      message.say(Helpers.getCodeBlock(imageText.join('\n\n')));
    });
  }
};
