const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const { CodenamesMatchModel } = require("../../../lib/models/schema");

module.exports = StringSelectMenu({
  customId: "select_spymasterlose",

  async execute(client, interaction, reply) {
    const selectedSpymasterLose = interaction.values[0];
    const channelId = interaction.member.voice.channelId;

    try {
      let storedMatch = await CodenamesMatchModel.findOne({
        channelId: channelId,
        done: false,
      });

      if (!storedMatch) {
        reply.edit({ components: [] });
        return await interaction.followUp({
          content: "No encontré la partida :c",
          ephemeral: true,
        });
      }

      // Actulizar los operativos y spymaster
      storedMatch.spyMasters[storedMatch.winner === "red" ? "blue" : "red"] =
        selectedSpymasterLose;
      storedMatch.operatives[storedMatch.winner === "red" ? "blue" : "red"] =
        storedMatch.teams[storedMatch.winner === "red" ? "blue" : "red"].filter(
          (userId) => userId !== selectedSpymasterLose
        );

      await storedMatch.save();

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("team_win_method")
          .setPlaceholder("¿Cómo ganaron?")
          .addOptions([
            {
              label: "Carta Negra",
              value: "BlackCard",
              description: "El equipo perdedor volteó la carta negra",
            },
            {
              label: "Cartas correctas",
              value: "CorrectCards",
              description:
                "El equipo ganador acertó todas las cartas.",
            },
          ])
      );

      reply.edit({
        content: "¿Cómo ganaron?",
        components: [row, new ActionRowBuilder().addComponents(RestartButton)],
      });
    } catch (error) {
      console.error("Error al seleccionar a los perdedores:", error);
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
