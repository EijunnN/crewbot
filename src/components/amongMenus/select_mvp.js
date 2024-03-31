const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { MatchModel } = require("../../../lib/models/schema");
const updateUserProfile = require("../../core/functions/updateUserProfile");

module.exports = StringSelectMenu({
  customId: "select-mvp",
  async execute(client, interaction, reply) {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "select-mvp"
    ) {
      const selectedUserId = interaction.values[0];
      const channelId = interaction.member.voice.channelId;

      try {
        let storedMatch = await MatchModel.findOne({ channelId, done: false });
        if (!storedMatch) {
          return await interaction.editReply({
            content: "No encontré la partida :c",
            components: [],
          });
        }

        storedMatch.mvpId = selectedUserId;
        storedMatch.done = true;
        await storedMatch.save();

        // Actualizar el perfil del MVP y de los demás participantes
        const updatePromises = storedMatch.participants.map((userId) => {
          const isWinner =
            storedMatch.winner === "tripulantes"
              ? storedMatch.crewmates.includes(userId)
              : storedMatch.impostors.includes(userId);
          const isMvp = userId === selectedUserId;
          const role = storedMatch.crewmates.includes(userId)
            ? "crewmate"
            : "impostor";
          return updateUserProfile(
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
            "Se han asignado puntos MVP. Detalles de la partida guardados.",
          components: [],
        });
      } catch (error) {
        console.error("Error al procesar el MVP:", error);
        await interaction.editReply({
          content: "Hubo un error al procesar tu solicitud.",
          components: [],
        });
      }
    } else {
      await reply.edit({
        content: "No encontré la partida :c",
        components: [],
      });
    }
  },
});
