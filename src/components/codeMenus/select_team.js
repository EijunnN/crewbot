// src/components/menus/select_impostores.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");

const { CodenamesMatchModel } = require("../../../lib/models/schema");

module.exports = StringSelectMenu({
  customId: "select_team",
  async execute(client, interaction, reply) {
    const selectedTeam = interaction.values[0];
    const channelId = interaction.member.voice.channelId;

    try {
      // Buscar la partida activa en MongoDB
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

      // Actualizar al ganador de la partida
      storedMatch.winner = selectedTeam;
      console.log(storedMatch.winner);

      await storedMatch.save();

      const participantsOptions = storedMatch.participants
        .map((userId) => {
          const member = interaction.guild.members.cache.get(userId);
          return member
            ? {
                label: member.displayName,
                value: userId,
                description: member.user.username,
              }
            : null;
        })
        .filter((option) => option !== null);

      if (participantsOptions.length === 0) {
        return interaction.editReply(
          "No hay participantes válidos para seleccionar como impostores."
        );
      }

      // Crear y enviar el menú para seleccionar el ganador
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_winners")
          .setPlaceholder("¿Quiénes lo conforman?")
          .addOptions(participantsOptions)
          .setMaxValues(storedMatch.participants.length)
      );

      reply.edit({
        content: "Elije a los ganadores:",
        components: [row, new ActionRowBuilder().addComponents(RestartButton)],
      });
    } catch (error) {
      console.error("Error al seleccionar Equipo:", error);
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
