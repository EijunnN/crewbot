const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const { MatchModel } = require("../../../lib/models/schema");

module.exports = StringSelectMenu({
  customId: "select_impostores",
  async execute(client, interaction, reply) {
    const selectedImpostores = interaction.values; // IDs de los impostores seleccionados
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

      
      storedMatch.impostors = selectedImpostores;
      storedMatch.crewmates = storedMatch.participants.filter(
        (userId) => !selectedImpostores.includes(userId)
      );
      
      await storedMatch.save();

      
      
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_winner")
          .setPlaceholder("¿Quién ganó la partida?")
          .addOptions([
            { label: "Tripulantes", value: "tripulantes" },
            { label: "Impostores", value: "impostores" },
          ])
      );

      reply.edit({
        content: "¿Quién ganó la partida?",
        components: [row, new ActionRowBuilder().addComponents(RestartButton)],
      });
    } catch (error) {
      console.error("Error al seleccionar impostores:", error);
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
