const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { UserModel, MatchModel } = require("../../../lib/models/schema");
const updateUserProfile = require("../../core/functions/updateUserProfile");

module.exports = StringSelectMenu({
  customId: "tripulantes_win_method",
  async execute(client, interaction, reply) {
    const method = interaction.values[0];
    const channelId = interaction.member.voice.channelId;

    try {
      let storedMatch = await MatchModel.findOne({
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

      storedMatch.winMethod = method;
      storedMatch.winner = "tripulantes";
      await storedMatch.save();

      await reply.edit({
        content: "Puntos asignados a los tripulantes.",
        components: [],
      });

      const mvpOptions = await Promise.all(
        storedMatch.crewmates
          .concat(storedMatch.impostors)
          .map(async (userId) => {
            try {
              // Intenta obtener el miembro de la caché primero
              let member = interaction.guild.members.cache.get(userId);
              // Si el miembro no está en caché, intenta buscarlo en el servidor
              if (!member) {
                member = await interaction.guild.members.fetch(userId);
              }
              // Si el miembro existe, retorna la opción con su información
              return {
                label: member.displayName,
                value: userId,
                description: member.user.username,
              };
            } catch (error) {
              // Si el miembro no se encuentra ni en caché ni en el servidor, maneja el caso
              console.error(
                `No se pudo encontrar al miembro con ID: ${userId}`,
                error
              );
              // Retorna un objeto de opción indicando que el usuario no se encontró
              return {
                label: `ID: ${userId}`,
                value: userId,
                description: "Usuario no encontrado",
              };
            }
          })
      );

      const mvpMenu = new StringSelectMenuBuilder()
        .setCustomId("select-mvp")
        .setPlaceholder("Selecciona el MVP de la partida")
        .addOptions(mvpOptions);

      await reply.edit({
        content: "Por favor, selecciona el MVP de la partida:",
        components: [new ActionRowBuilder().addComponents(mvpMenu)],
      });
    } catch (error) {
      console.error(
        "Error al procesar el método de victoria de los tripulantes:",
        error
      );
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
