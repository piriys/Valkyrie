// Request
const request = require('request');
const queryString = require('querystring');

// Helpers
const Helpers = require('./../helpers.js');
const OpenWeatherHelpers = require('../openWeatherHelpers.js');

// Discord.js-commando
const { Command } = require('discord.js-commando');

module.exports = class AddCookieCommand extends Command {
  constructor(discordClient) {
    super(discordClient, {
      name: 'weather',
      group: 'util',
      memberName: 'weather',
      aliases: ['wt'],
      description: 'Look up weather of a location',
      throttling: {
        usages: 5,
        duration: 10
      },
      args: [
        {
          key: 'location',
          prompt: 'Location search',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  run(message, { location }) {
    if (!location) {
      return message.reply('please enter a location to search for!');
    }
    message.reply('one moment please...');

    const optionsUrl = ['https://api.openweathermap.org/data/2.5/weather?'];
    optionsUrl.push(`APPID=${process.env.V_OPENWEATHER_KEY}`);
    optionsUrl.push(`&q=${queryString.escape(location)}`);
    optionsUrl.push(`&units=imperial`);

    const options = {
      url: optionsUrl.join('')
    };

    request.get(options, (error, response, body) => {
      const jsonResponse = JSON.parse(body);
      if (error || (jsonResponse && jsonResponse.cod !== 200)) {
        console.error(error);
        return message.say(
          `I don't find anything related to that search location :(`
        );
      }
      const weather = jsonResponse.weather[0];
      const locationName = jsonResponse.name;
      let country = OpenWeatherHelpers.getCountryNameFromCountryCode(
        jsonResponse.sys.country
      );
      country = country !== locationName ? `, ${country}` : '';

      const reply = [];

      reply.push(
        `Here is the current weather in __**${locationName}${country}**__!`
      );
      reply.push(
        `> ${OpenWeatherHelpers.getWeatherSymbolFromId(
          weather.id
        )} __**${weather.description.toUpperCase()}**__`
      );

      const main = jsonResponse.main;
      const wind = jsonResponse.wind;

      reply.push(
        `> **Temp**: ${main.temp}°F (min ${main.temp_min}/max ${main.temp_max})`
      );
      reply.push(`> **Feels Like**: ${main.feels_like}°F`);
      reply.push(`> **Wind**: ${wind.speed} mph (${wind.deg}°)`);
      return message.say(reply.join('\n'));
    });
  }
};
