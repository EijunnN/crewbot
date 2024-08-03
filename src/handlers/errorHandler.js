const { WebhookClient, codeBlock, userMention } = require("discord.js");
const { inspect } = require("util");

class CustomStringBuilder {
  constructor(initialContent = "") {
    this.content = initialContent;
  }

  update(newContent, separator = "") {
    this.content += separator + newContent;
    return this;
  }

  toString() {
    return this.content;
  }
}

const webhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/1169782642099626015/Seh_4O9jH--1-jYN2iBtDA67qg2PYE9VcfYafvbcH88hPTgXmXM8PKAuakN2IEResraH",
});

/**
 * @param {import("../core/classes/Client")} client
 */
module.exports = (client) => {
  process.removeAllListeners();
  client.removeAllListeners();

  const errorHandler = async (error, origin) => {
    console.error(error);

    const content = new CustomStringBuilder(
      `**:${userMention("661899688454389770")} something's wrong**\n`
    );

    content.update(
      codeBlock(inspect(error, { depth: 0 }).slice(0, 1000)),
      "\n"
    );

    if (origin) {
      content.update(`**Origin:** ${origin}`, "\n");
    }

    try {
      await webhook.send({ content: content.toString() });
    } catch (webhookError) {
      console.error("Failed to send error to webhook:", webhookError);
    }
  };

  process.on("unhandledRejection", (reason) => errorHandler(reason, "Unhandled Rejection"));
  process.on("uncaughtException", (error) => errorHandler(error, "Uncaught Exception"));

  client.on("error", (error) => errorHandler(error, "Discord Client Error"));
  client.on("warn", (info) => console.warn(info));

  // Opcional: Manejar errores de shards si estás usando sharding
  client.on("shardError", (error, shardId) => errorHandler(error, `Shard Error (Shard ${shardId})`));
};