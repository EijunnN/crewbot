// select_score_blue.js
const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputComponent,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const {
  CodenamesMatchModel,
  CodenamesUserModel,
} = require("../../../lib/models/schema");

const {
  updateUserProfile,
} = require("../../core/functions/codenames/updateUserProfileCode");
const updateUserProfileCode = require("../../core/functions/codenames/updateUserProfileCode");

module.exports = StringSelectMenu({
  customId: "select_score_blue",

  async execute(client, interaction, reply) {
    const selectedScore = interaction.values[0];
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

      storedMatch.score.blue = selectedScore;
      storedMatch.done = true;
      await storedMatch.save();

      const updatePromises = storedMatch.participants.map((userId) => {
        const isWinner =
          storedMatch.winner === "blue"
            ? storedMatch.teams.blue.includes(userId)
            : storedMatch.teams.red.includes(userId);
        const isMvp = userId === storedMatch.mvpId;
        const role = storedMatch.teams.blue.includes(userId) ? "blue" : "red";
        return updateUserProfileCode(
          userId,
          isWinner,
          isMvp,
          role,
          storedMatch.matchId
        );
      });

      await Promise.all(updatePromises);

      await interaction.editReply({
        content:
          "Se han asignado los puntos correctamente. Detalles de la partida guardados.",
        components: [],
      });
    } catch (error) {
      console.error("Error al seleccionar el score del equipo azul:", error);
      await interaction.editReply({
        content: "Error al seleccionar el score del equipo azul",
        ephemeral: true,
      });
    }
  },
});
