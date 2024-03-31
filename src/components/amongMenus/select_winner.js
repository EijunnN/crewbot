const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const { MatchModel } = require("../../../lib/models/schema");
const updateUserProfile = require("../../core/functions/updateUserProfile");

module.exports = StringSelectMenu({
  customId: "select_winner",
  async execute(client, interaction, reply) {
    const channelId = interaction.member.voice.channelId;
    const crewmatesWin = interaction.values[0] === "tripulantes";

    try {
      let storedMatch = await MatchModel.findOne({ channelId, done: false });

      if (!storedMatch) {
        return await interaction.editReply({
          content: "No encontré la partida :c",
          components: [],
        });
      }

      storedMatch.winner = crewmatesWin ? "tripulantes" : "impostores";
      await storedMatch.save();

      const victoryMethodMenu = new StringSelectMenuBuilder()
        .setCustomId(
          crewmatesWin ? "tripulantes_win_method" : "impostores_win_method"
        )
        .setPlaceholder(
          crewmatesWin
            ? "¿Cómo ganaron los tripulantes?"
            : "¿Cómo ganaron los impostores?"
        )
        .addOptions(
          crewmatesWin
            ? [
                { label: "Completando misiones", value: "misiones" },
                {
                  label: "Descubriendo a los impostores",
                  value: "descubrimiento",
                },
              ]
            : [
                { label: "Matando a todos", value: "matando" },
                { label: "Por votaciones", value: "votaciones" },
                { label: "Por sabotaje", value: "sabotaje" },
              ]
        );

      const actionRow = new ActionRowBuilder().addComponents(victoryMethodMenu);
      const actionRow2 = new ActionRowBuilder().addComponents(RestartButton);

      await interaction.editReply({
        content: "¿Cómo ganaron?",
        components: [actionRow, actionRow2],
      });
    } catch (error) {
      console.error("Error al seleccionar ganador:", error);
      await interaction.editReply({
        content: "Hubo un error al procesar tu solicitud.",
        components: [],
      });
    }
  },
});
