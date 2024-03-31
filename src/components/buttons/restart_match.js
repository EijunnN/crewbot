const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const {
  MatchModel,
  CodenamesMatchModel,
} = require("../../../lib/models/schema"); 

module.exports = StringSelectMenu({
  customId: "restart_match",
  async execute(client, interaction, reply) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return await interaction.followUp({
        content: "Debes estar en una sala de voz para usar este botón.",
        ephemeral: true,
      });
    }

    // Buscar la partida activa en la base de datos
    let match = (await MatchModel.findOne({
      channelId: voiceChannel.id,
      done: false,
    }))
      ? await MatchModel.findOne({
          channelId: voiceChannel.id,
          done: false,
        })
      : await CodenamesMatchModel.findOne({
          channelId: voiceChannel.id,
          done: false,
        });

    if (match && match.gameType === "AmongUs") {
      const memberFetchPromises = match.participants.map((userId) =>
        voiceChannel.guild.members.fetch(userId).catch(() => null)
      );

      const members = await Promise.all(memberFetchPromises);
      const options = members
        .filter((member) => member != null)
        .map((member) => ({
          label: member.displayName,
          value: member.id,
          description: member.user.username,
        }));

      if (options.length === 0) {
        return await interaction.followUp({
          content:
            "No hay participantes guardados de la partida anterior en este canal.",
          ephemeral: true,
        });
      }

      const selectMenuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_impostores")
          .setPlaceholder("Selecciona a los impostores")
          .addOptions(options)
          .setMaxValues(match.participants.length)
      );

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("restart_match")
          .setLabel("Reiniciar Selección")
          .setStyle(ButtonStyle.Secondary)
      );

      await reply.edit({
        content:
          "Por favor, selecciona a los Usuarios que jugaron en la partida como impostores:",
        components: [selectMenuRow, buttonRow],
      });
    } else if (match && match.gameType === "Codenames") {
      // const memberFetchPromises = match.participants.map((userId) =>
      //   voiceChannel.guild.members.fetch(userId).catch(() => null)
      // );

      // const members = await Promise.all(memberFetchPromises);
      const participantsOptions = [
        {
          label: "Rojo",
          value: "red",
          description: "Equipo rojo",
          emoji: "🟥",
        },
        {
          label: "Azul",
          value: "blue",
          description: "Equipo azul",
          emoji: "🟦",
        },
      ];

      const selectMenuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_team")
          .setPlaceholder("Selecciona al equipo ganador")
          .addOptions(participantsOptions)
          .setMaxValues(1)
      );

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("restart_match")
          .setLabel("Reiniciar Selección")
          .setStyle(ButtonStyle.Secondary)
      );

      await reply.edit({
        content: "Por favor, selecciona al Equipo que ganó la partida:",
        components: [selectMenuRow, buttonRow],
      });
    } else {
      await reply.delete();
    }
  },
});
