// Request
const request = require('request');
const queryString = require('querystring');

// Helpers
const Helpers = require('./../helpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

module.exports = class AddCookieCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'mdn',
      group: 'docs',
      alias: ['MDN'],
      memberName: 'mdn',
      description: 'Look up documentation from MDN',
      throttling: {
        usages: 5,
        duration: 10
      },
      args: [
        {
          key: 'search',
          prompt: 'Search term',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  run(message, { search }) {
    if (!search) {
      return message.reply('please enter a search term!');
    }

    message.reply('one moment please...');
    const optionsUrl = ['https://developer.mozilla.org/en-US/search.json?'];
    optionsUrl.push(`q=${queryString.escape(search)}`);
    optionsUrl.push('&highlight=false');

    const options = {
      url: optionsUrl.join('')
    };

    request.get(options, (error, response, body) => {
      const jsonResponse = JSON.parse(body);
      if (error || jsonResponse.count === 0) {
        console.error(error);
        return message.reply(
          `I don't find anything related to that search term :(`
        );
      }

      console.log(jsonResponse);
      const mdnDocument = jsonResponse.documents[0];

      const docsUrl = `https://developer.mozilla.org/en-US/docs/${mdnDocument.slug}`;
      const reply = [
        `Here is what I found about __**${mdnDocument.title}**__ (from ${docsUrl}):`,
        Helpers.getCodeBlock(mdnDocument.excerpt)
      ];

      return message.say(reply.join('\n'));
    });
  }
};
