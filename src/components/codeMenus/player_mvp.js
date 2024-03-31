const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ModalBuilder,
} = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const {
  CodenamesMatchModel,
  CodenamesUserModel,
} = require("../../../lib/models/schema");

module.exports = StringSelectMenu({
  customId: "player_mvp",

  async execute(client, interaction, reply) {
    const selectedMVP = interaction.values[0];
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

      storedMatch.mvpId = selectedMVP;
      await storedMatch.save();

      let score = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      let scoreOptions = score.map((score) => {
        return {
          label: `${score}`,
          value: `${score}`,
        };
      });

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_score_red")
          .setPlaceholder("Selecciona el score del equipo rojo")
          .addOptions(scoreOptions)
          .setMaxValues(1)
      );

      await reply.edit({
        content: "Selecciona el score del equipo Rojo:",
        components: [row, new ActionRowBuilder().addComponents(RestartButton)],
      });
    } catch (error) {
      console.error("Error al seleccionar MVP:", error);
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
