
const { ButtonBuilder, ButtonStyle } = require("discord.js");

const RestartButton = new ButtonBuilder()
  .setStyle(ButtonStyle.Danger)
  .setCustomId("restart_match")
  .setLabel("Reiniciar");

module.exports = { RestartButton };
