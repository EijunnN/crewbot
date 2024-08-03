const { EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { UserModel } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "mvp",
  description: "Mira el top 15 de MVP",
  async execute(client, interaction) {
    const ALLOWED_CHANNEL_ID = "1175911160982274068"; // canal de comandos compe
    const PRIVILEGED_ROLE_ID = "1172263693111795822";

    if (!canExecuteCommand(interaction, ALLOWED_CHANNEL_ID, PRIVILEGED_ROLE_ID)) {
      return interaction.reply({
        content: `Este comando solo se puede usar en el canal <#${ALLOWED_CHANNEL_ID}> por usuarios sin el rol especial.`,
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const users = await getTopMVPUsers();
      const embed = await createMVPEmbed(interaction, users, client);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al recuperar los puntos MVP:", error);
      await interaction.editReply("Hubo un error al recuperar los datos de MVP.");
    }
  },
});

function canExecuteCommand(interaction, allowedChannelId, privilegedRoleId) {
  const hasPrivilegedRole = interaction.member.roles.cache.has(privilegedRoleId);
  return hasPrivilegedRole || interaction.channelId === allowedChannelId;
}

async function getTopMVPUsers() {
  return await UserModel.find({ mvpPoints: { $gt: 0 } })
    .sort({ mvpPoints: -1 })
    .limit(15);
}

async function createMVPEmbed(interaction, users, client) {
  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle(`Top 15 MVP en ${interaction.guild.name}`);

  if (users.length > 0) {
    const userIds = users.map(user => user.id);
    const guildMembers = await fetchGuildMembers(interaction.guild, userIds);

    const topMVPUser = guildMembers.get(users[0].id);
    embed.setThumbnail(topMVPUser?.displayAvatarURL() || null);

    users.forEach((user, index) => {
      const member = guildMembers.get(user.id);
      const userName = member?.displayName || `${user.id}`;
      embed.addFields({
        name: `${index + 1}. ${userName}${index === 0 ? " 👑" : ""} | \`⭐${user.mvpPoints}\``,
        value: " ",
      });
    });

    const authorMember = interaction.member;
    if (!users.some(user => user.id === authorMember.id)) {
      embed.setFooter({
        text: `${authorMember.displayName} no está en el top 15.`,
        iconURL: authorMember.displayAvatarURL(),
      });
    }
  } else {
    embed.setDescription("Aún no hay jugadores con puntos MVP.");
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