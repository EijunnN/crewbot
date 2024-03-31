const { ChatCommand } = require("../../utils/commands");

module.exports = ChatCommand({
  name: "ping",
  description: "Calcula el ping del bot",
  async execute(client, interaction) {
    const reply = await interaction.deferReply({ fetchReply: true });
    await interaction.editReply({
      content: `🏓 Ping: \`${client.ws.ping}\` ms\n❇️ Interacción: \`${
        reply.createdTimestamp - interaction.createdTimestamp
      }\` ms`,
    });
  },
});
