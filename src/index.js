// src/utils/index.js
require("dotenv").config();
const { GatewayIntentBits } = require("discord.js");
const { Client } = require("./core");
const listenEvents = require("./utils/listenEvents");
const listenHandlers = require("./utils/listenHandlers");
const readCommands = require("./utils/readCommands");
const readComponents = require("./utils/readComponents");
const { connectToDB } = require("../lib/mongoose");
// const { cron } = require("../src/core/tasks/checkInactivity");

const main = async () => {
  await connectToDB();
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
    ],
  });
  listenHandlers(client, __dirname, "handlers");
  listenEvents(client, __dirname, "events");
  readCommands(client, __dirname, "commands");
  readComponents(client, __dirname, "components");
  
  client.login(process.env.DISCORD_TOKEN);
  
};

main();
