module.exports = class Helpers {
  static getCompositeId(message, userId) {
    return `${
      message.channel.type === 'text' ? message.channel.id : '(Unknown Server)'
    }:${userId}`;
  }
  static getCodeBlock(text) {
    return `\`\`\`${text}\`\`\``;
  }
  static pluralize(count, noun) {
    const esEnd = new Set(['h', 's', 'x', 'z']);
    return (
      noun +
      (count > 1 ? `${esEnd.has(noun[noun.length - 1]) ? 'e' : ''}s` : '')
    );
  }
  static getHelpMessage() {
    const reply = [];

    reply.push(`\n**Start these commands with \`@Valkyrie\` or \`$\`:**`);
    reply.push('> `$help`, `$h`: view a list of commands like this one!');
    reply.push(
      '> `$cookieleaderboard`, `$c_l`: view a leaderboard of who earned the most cookies in this server!'
    );
    reply.push(
      '> `$rpsleaderboard`, `$rps_l`: view a leaderboard Rock Paper Scissors players!'
    );
    reply.push(
      '> `$imagetotext <url>`, `$img_t <url>`: transcribe an image from an image url!'
    );
    reply.push(
      '> `$identifyimage <url>`, `$img_id <url>`: identify objects in an image from an image url!'
    );
    reply.push(
      '> `$weather <location>`, `$wt <location>`: find out the current weather in a given location!'
    );
    reply.push(
      '> `$mdn <search term>`, look up documentation from MDN Web Docs!'
    );

    reply.push(`**You can also:**`);
    reply.push(
      '> `Play rock-paper-scissors`: by typing `@Valkyrie` followed by `rock`, `paper`, or `scissors`!'
    );
    reply.push(
      '> `Give a cookie to other user`: by mention `@<username>` followed by `:cookie:` :cookie:!'
    );

    return reply.join('\n');
  }
};
