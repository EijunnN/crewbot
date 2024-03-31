
const { StringBuilder } = require("@wave-dev/plugins");
const { WebhookClient, codeBlock, userMention } = require("discord.js");
const { inspect } = require("util");
const Client = require("../core/classes/Client");
const webhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/1169782642099626015/Seh_4O9jH--1-jYN2iBtDA67qg2PYE9VcfYafvbcH88hPTgXmXM8PKAuakN2IEResraH",
});
/**
 * @param {Client} client
 */
// ${userMention(
//   "397867138150301696"
// )}
module.exports = (client) => {
  process.removeAllListeners();
  client.removeAllListeners();
  const content = new StringBuilder(
    `**:${userMention("661899688454389770")} something's wrong**`
  );
  process.on("unhandledRejection", (reason) => {
    console.log(reason);
    content.update(
      codeBlock(inspect(reason, { depth: 0 }).slice(0, 1000)),
      "\n"
    );
    webhook.send({ content: content.toString() });
  });
  process.on("uncaughtException", (error, origin) => {
    // console.log(error);

    content.update(
      codeBlock(inspect(error, { depth: 0 }).slice(0, 1000)),
      "\n"
    );
    webhook.send({ content: content.toString() });
  });
};
