const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const { CodenamesMatchModel } = require("../../../lib/models/schema");

module.exports = StringSelectMenu({
  customId: "select_spymasterwin",

  async execute(client, interaction, reply) {
    const selectedSpymasterWin = interaction.values[0];
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
      storedMatch.spyMasters[storedMatch.winner] = selectedSpymasterWin;
      storedMatch.operatives[storedMatch.winner] = storedMatch.teams[
        storedMatch.winner
      ].filter((userId) => userId !== selectedSpymasterWin);

      const spyMasterLose = storedMatch.teams[
        storedMatch.winner === "red" ? "blue" : "red"
      ]
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

      await storedMatch.save();

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_spymasterlose")
          .setPlaceholder(
            `¿Quién fue el spymaster del Team ${
              storedMatch.winner === "red" ? "BLUE" : "RED"
            }?`
          )
          .addOptions(spyMasterLose)
          .setMaxValues(1)
      );

      reply.edit({
        content: `Elija al spymaster del equipo Perdedor ${
          storedMatch.winner === "red" ? "BLUE" : "RED"
        }`,
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
