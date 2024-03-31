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
  customId: "team_win_method",

  async execute(client, interaction, reply) {
    const selectedWinMethod =
      interaction.values[0] === "BlackCard" ? "BlackCard" : "CorrectCards";
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

      storedMatch.winMethod = selectedWinMethod;
      console.log(storedMatch.winMethod);
      await storedMatch.save();

      // blackCardOptions es un array del equipo perdedor
      let teamLose = storedMatch.winner === "red" ? "blue" : "red";
      console.log(`Equipo perder es: ${teamLose}`);
      const blackCardOptions = storedMatch.teams[teamLose]
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

      let teamWin = storedMatch.winner;
      const correctCardsOptions = storedMatch.teams[teamWin]
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

      if (selectedWinMethod === "BlackCard") {
        const blackCardRow = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_blackcard")
            .setPlaceholder("¿Quiénes son los responsables?")
            .addOptions(blackCardOptions)
            .setMaxValues(storedMatch.teams[teamLose].length)
        );

        reply.edit({
          content: "Selecciona a los responsables de voltear la carta negra",
          components: [
            blackCardRow,
            new ActionRowBuilder().addComponents(RestartButton),
          ],
        });
      } else {
        const mvp = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("player_mvp")
            .setPlaceholder("¿Quién fue el MVP?")
            .addOptions(correctCardsOptions)
            .setMaxValues(1)
        );

        reply.edit({
          content: "Selecciona al MVP de la partida",
          components: [
            mvp,
            new ActionRowBuilder().addComponents(RestartButton),
          ],
        });
      }
    } catch (error) {
      console.error("Error al seleccionar a los perdedores:", error);
      await interaction.followUp({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
  },
});
