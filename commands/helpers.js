module.exports = class Helpers {
  static getCompositeId(message, userId) {
    return `${
      message.channel.type === 'text' ? message.channel.id : '(Unknown Server)'
    }:${userId}`;
  }
  static getCodeBlock(text) {
    return `\`\`\`${text}\`\`\``;
  }
  static nounSuffix(count, vowelEnd = false) {
    return count > 1 ? `${vowelEnd ? 'e' : ''}s` : '';
  }
};
