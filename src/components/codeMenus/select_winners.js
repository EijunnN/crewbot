const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const { CodenamesMatchModel } = require("../../../lib/models/schema");

module.exports = StringSelectMenu({
  customId: "select_winners",

  async execute(client, interaction, reply) {
    const selectedWinners = interaction.values; // IDs de los ganadores seleccionados
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

      // Falta colocar a los ganadores en el equipo ganador y a los perdedores en el equipo perdedor

      // Actualizar a los ganadores de la partida
      if (storedMatch.winner === "red") {
        storedMatch.teams.red = selectedWinners;
        storedMatch.teams.blue = storedMatch.participants.filter(
          (userId) => !selectedWinners.includes(userId)
        );
      } else {
        storedMatch.teams.blue = selectedWinners;
        storedMatch.teams.red = storedMatch.participants.filter(
          (userId) => !selectedWinners.includes(userId)
        );
      }
      console.log(storedMatch.teams);
      await storedMatch.save();

      const spymasterTeamWinner = storedMatch.teams[storedMatch.winner]
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

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_spymasterwin")
          .setPlaceholder(
            `¿Quién fue el spymaster del Team ${storedMatch.winner.toUpperCase()}?`
          )
          .addOptions(spymasterTeamWinner)
          .setMaxValues(1)
      );

      reply.edit({
        content: `Elije al spymaster del equipo Ganador ${(storedMatch.winner ===
        "red"
          ? "rojo"
          : "azul"
        ).toUpperCase()}`,
        components: [row, new ActionRowBuilder().addComponents(RestartButton)],
      });
    } catch (error) {
      console.error("Error al seleccionar a los ganadores:", error);
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
