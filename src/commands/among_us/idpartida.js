const {
  UserModel,
  MatchModel,
  CodenamesMatchModel,
  CodenamesUserModel,
} = require("../../../lib/models/schema");
const { ChatCommand } = require("../../utils/commands");
const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  formatEmoji,
} = require("discord.js");

module.exports = ChatCommand({
  name: "idpartida",
  description: "Muestra detalles de una partida específica",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "matchid",
      description: "ID de la partida",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "game",
      description: "Selecciona el juego del cual quieres ver el historial",
      required: true,
      choices: [
        { name: "Among Us", value: "AmongUs" },
        { name: "Codenames", value: "Codenames" },
      ],
    },
  ],
  async execute(client, interaction) {
    const ALLOWED_CHANNEL_ID = "1175911160982274068"; //comandos compe
    const PRIVILEGED_ROLE_ID = "1172263693111795822";

    if (
      !canExecuteCommand(interaction, ALLOWED_CHANNEL_ID, PRIVILEGED_ROLE_ID)
    ) {
      return interaction.reply({
        content: `Este comando solo se puede usar en el canal <#${ALLOWED_CHANNEL_ID}> por usuarios sin el rol especial.`,
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const game = interaction.options.getString("game");
    const matchId = interaction.options
      .getString("matchid", true)
      .replace(/`/g, "");

    try {
      const embed =
        game === "AmongUs"
          ? await createAmongUsEmbed(client, interaction, matchId)
          : await createCodenamesEmbed(client, interaction, matchId);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(
        `Error al procesar la partida ${matchId} de ${game}:`,
        error
      );
      await interaction.editReply(
        "Hubo un error al procesar la partida. Por favor, inténtalo de nuevo más tarde."
      );
    }
  },
});

function canExecuteCommand(interaction, allowedChannelId, privilegedRoleId) {
  const hasPrivilegedRole =
    interaction.member.roles.cache.has(privilegedRoleId);
  return hasPrivilegedRole || interaction.channelId === allowedChannelId;
}

async function createAmongUsEmbed(client, interaction, matchId) {
  const match = await MatchModel.findOne({ matchId: matchId });
  if (!match || !match.done) {
    throw new Error("Partida no encontrada o no finalizada");
  }

  const mvpUser = match.mvpId
    ? await client.users.fetch(match.mvpId).catch(() => null)
    : null;
  const userIds = [...match.crewmates, ...match.impostors, match.mvpId].filter(
    Boolean
  );
  const guildMembers = await fetchGuildMembers(interaction.guild, userIds);

  const embed = new EmbedBuilder()
    .setTitle(`Detalles de la Partida de Among Us`)
    .setColor("Blue")
    .setThumbnail(mvpUser?.displayAvatarURL() || client.user.displayAvatarURL())
    .addFields(
      { name: "Id de la partida", value: match.matchId },
      {
        name: "Fecha 📅",
        value: new Date(match.date).toLocaleDateString("es-ES"),
        inline: true,
      },
      { name: "Método de Victoria", value: match.winMethod, inline: true },
      {
        name: "MVP ⭐",
        value: mvpUser?.username || "No disponible",
        inline: true,
      },
      {
        name: "Tripulantes",
        value: formatUserList(guildMembers, match.crewmates),
        inline: false,
      },
      {
        name: "Impostores",
        value: formatUserList(guildMembers, match.impostors),
        inline: false,
      },
      { name: "Duración ⏱️", value: match.duration, inline: true },
      {
        name: `Resultado ${formatEmoji("1178079253955350578")}`,
        value: match.winner === "tripulantes" ? "Tripulantes" : "Impostores",
        inline: true,
      }
    )
    .setFooter({ text: "Más información sobre la partida" })
    .setTimestamp();

  return embed;
}

async function createCodenamesEmbed(client, interaction, matchId) {
  const match = await CodenamesMatchModel.findOne({ matchId: matchId });
  if (!match || !match.done) {
    throw new Error("Partida no encontrada o no finalizada");
  }

  const mvpUser = match.mvpId
    ? await client.users.fetch(match.mvpId).catch(() => null)
    : null;
  const userIds = [
    ...match.operatives.blue,
    ...match.operatives.red,
    match.spyMasters.blue,
    match.spyMasters.red,
    match.mvpId,
  ].filter(Boolean);
  const guildMembers = await fetchGuildMembers(interaction.guild, userIds);

  const embed = new EmbedBuilder()
    .setTitle(`Detalles de la Partida de Codenames`)
    .setColor("Random")
    .setThumbnail(mvpUser?.displayAvatarURL() || client.user.displayAvatarURL())
    .addFields(
      { name: "Id de la partida", value: match.matchId, inline: true },
      {
        name: "Fecha 📅",
        value: new Date(match.createdAt).toLocaleDateString("es-ES"),
        inline: true,
      },
      {
        name: "MVP ⭐",
        value: mvpUser?.username || "No disponible",
        inline: true,
      },
      {
        name: "Operativos Azules",
        value:
          formatUserList(guildMembers, match.operatives.blue) ||
          "No hay Operativos Azules",
        inline: true,
      },
      {
        name: "Operativos Rojos",
        value:
          formatUserList(guildMembers, match.operatives.red) ||
          "No hay Operativos Rojos",
        inline: true,
      },
      { name: " ", value: " ", inline: true },
      {
        name: "Spymaster Azul",
        value: formatUser(guildMembers, match.spyMasters.blue),
        inline: true,
      },
      {
        name: "Spymaster Rojo",
        value: formatUser(guildMembers, match.spyMasters.red),
        inline: true,
      },
      {
        name: "Score",
        value: `🟥 ${match.score.red} - ${match.score.blue} 🟦`,
        inline: true,
      },
      {
        name: `Resultado ${formatEmoji("1178079253955350578")}`,
        value: match.winner === "blue" ? "Equipo Azul 🟦" : "Equipo Rojo 🟥",
        inline: true,
      },
      {
        name: "Método de Victoria",
        value:
          match.winMethod === "BlackCard" ? "Tarjeta Negra" : "Todas Acertadas",
        inline: true,
      }
    )
    .setFooter({ text: "Más información sobre la partida" })
    .setTimestamp();

  return embed;
}

async function fetchGuildMembers(guild, userIds) {
  try {
    return await guild.members.fetch({ user: userIds });
  } catch (error) {
    console.error("Error al obtener miembros del servidor:", error);
    return new Map();
  }
}

function formatUserList(guildMembers, userIds) {
  return userIds.map((id) => formatUser(guildMembers, id)).join("\n");
}

function formatUser(guildMembers, userId) {
  const member = guildMembers.get(userId);
  return member ? `<@${member.id}>` : `ID: ${userId}`;
}
