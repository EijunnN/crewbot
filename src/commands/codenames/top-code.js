// src/commands/among_us/top.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { CodenamesUserModel } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "top-code",
  description: "Mira el top 10",
  async execute(client, interaction) {
    const allowedChannelId = "1175911160982274068"; //comandos compe
    const privilegedRoleId = "1172263693111795822";

    // Verificar si el usuario tiene el rol privilegiado
    const hasPrivilegedRole =
      interaction.member.roles.cache.has(privilegedRoleId);

    // Verificar si el comando se está ejecutando en el canal correcto o si el usuario tiene el rol privilegiado
    if (!hasPrivilegedRole && interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: `Este comando solo se puede usar en el canal <#${allowedChannelId}> por usuarios sin el rol especial.`,
        ephemeral: true,
      });
    }

    // Obtener y ordenar perfiles de usuarios por puntos, excluyendo a aquellos con 0 puntos
    const users = await CodenamesUserModel.find({ puntos: { $gt: 0 } })
      .sort({ puntos: -1 })
      .limit(10);

    // Crear el embed
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(`TOP 10 en ${interaction.guild.name}`);

    // Establecer el thumbnail si hay usuarios en el top
    if (users.length > 0) {
      const topUser = await client.users.fetch(users[0].id);
      embed.setThumbnail(topUser.displayAvatarURL());
    } else {
      embed.setDescription("Aún no han habido partidas.");
    }

    // Agregar los campos de los usuarios en el top
    users.forEach((user, index) => {
      const userName = client.users.cache.get(user.id)?.displayName ?? user.id;
      // const userName = client.users.cache.get(user.id)?.username ?? user.id;
      embed.addFields({
        name: `${index + 1}. ${userName}${index === 0 ? " 👑" : ""} | \`🎖️${
          user.puntos
        }\``,
        value: " ",
      });
    });

    // Enviar el embed junto con el menú de selección de ligas
    await interaction.reply({
      embeds: [embed],
      components: [createLeagueMenu()],
    });
  },
});

function createLeagueMenu() {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("select_league_code")
    .setPlaceholder("Selecciona una liga")

    .addOptions([
      {
        label: "Liga Radiante",
        value: "Radiante",
        emoji: "1192014930644320309",
      },
      {
        label: "Liga Diamante",
        value: "Diamante",
        emoji: "1180597339812024491",
      },
      { label: "Liga Platino", value: "Platino", emoji: "1180597342907412501" },
      { label: "Liga Oro", value: "Oro", emoji: "1180597345017143356" },
      { label: "Liga Plata", value: "Plata", emoji: "1180597348112539698" },
      { label: "Liga Bronce", value: "Bronce", emoji: "1180595911471144980" },
    ]);

  return new ActionRowBuilder().addComponents(selectMenu);
}
