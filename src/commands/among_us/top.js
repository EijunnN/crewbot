const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { UserModel } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "top",
  description: "Mira el top 10 de usuarios",
  async execute(client, interaction) {
    const ALLOWED_CHANNEL_ID = "1175911160982274068"; // canal de comandos compe
    const PRIVILEGED_ROLE_ID = "1172263693111795822";

    if (!canExecuteCommand(interaction, ALLOWED_CHANNEL_ID, PRIVILEGED_ROLE_ID)) {
      return interaction.reply({
        content: `Este comando solo se puede usar en el canal <#${ALLOWED_CHANNEL_ID}> por usuarios sin el rol especial.`,
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      const users = await getTopUsers();
      const embed = await createTopEmbed(interaction, users);
      await interaction.editReply({
        embeds: [embed],
        components: [createLeagueMenu()]
      });
    } catch (error) {
      console.error("Error al recuperar el top de usuarios:", error);
      await interaction.editReply("Hubo un error al recuperar los datos del top.");
    }
  }
});

function canExecuteCommand(interaction, allowedChannelId, privilegedRoleId) {
  const hasPrivilegedRole = interaction.member.roles.cache.has(privilegedRoleId);
  return hasPrivilegedRole || interaction.channelId === allowedChannelId;
}

async function getTopUsers() {
  return await UserModel.find({ puntos: { $gt: 0 } })
    .sort({ puntos: -1 })
    .limit(10);
}

async function createTopEmbed(interaction, users) {
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle(`TOP 10 en ${interaction.guild.name}`);

  if (users.length > 0) {
    const userIds = users.map(user => user.id);
    const guildMembers = await fetchGuildMembers(interaction.guild, userIds);

    const topUser = guildMembers.get(users[0].id);
    embed.setThumbnail(topUser?.displayAvatarURL() || null);
    
    users.forEach((user, index) => {
      const member = guildMembers.get(user.id);
      const userName = member?.displayName || `Usuario ${user.id}`;
      embed.addFields({
        name: `${index + 1}. ${userName}${index === 0 ? " 👑" : ""} | \`🎖️${user.puntos}\``,
        value: " " // Espacio en blanco invisible
      });
    });
  } else {
    embed.setDescription("Aún no han habido partidas.");
  }

  return embed;
}

async function fetchGuildMembers(guild, userIds) {
  try {
    const members = await guild.members.fetch({ user: userIds });
    return members;
  } catch (error) {
    console.error("Error al obtener miembros del servidor:", error);
    return new Map();
  }
}

function createLeagueMenu() {
  const leagues = [
    { label: "Liga Radiante", value: "Radiante", emoji: "1192014930644320309" },
    { label: "Liga Diamante", value: "Diamante", emoji: "1180597339812024491" },
    { label: "Liga Platino", value: "Platino", emoji: "1180597342907412501" },
    { label: "Liga Oro", value: "Oro", emoji: "1180597345017143356" },
    { label: "Liga Plata", value: "Plata", emoji: "1180597348112539698" },
    { label: "Liga Bronce", value: "Bronce", emoji: "1180595911471144980" }
  ];

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_league")
      .setPlaceholder("Selecciona una liga")
      .addOptions(leagues.map(league => ({
        label: league.label,
        value: league.value,
        emoji: league.emoji
      })))
  );
}