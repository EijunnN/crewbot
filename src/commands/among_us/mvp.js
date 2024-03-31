const { EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { UserModel } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "mvp",
  description: "Mira el top 10 de MVP",
  async execute(client, interaction) {
    try {
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

      // Recuperar y ordenar los perfiles de usuario por puntos MVP de MongoDB
      const users = await UserModel.find({ mvpPoints: { $gt: 0 } })
        .sort({ mvpPoints: -1 }) // Orden descendente
        .limit(15);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`Top 15 MVP en ${interaction.guild.name}`);

      if (users.length > 0) {
        const topMVPUser = await client.users.fetch(users[0].id);
        embed.setThumbnail(topMVPUser.displayAvatarURL());

        users.forEach((user, index) => {
          const userName =
            client.users.cache.get(user.id)?.displayName ?? user.id;
          embed.addFields({
            name: `${index + 1}. ${userName}${
              index === 0 ? " 👑" : ""
            } |  \`⭐${user.mvpPoints}\``,
            value: " ",
          });
        });

        const authorPosition = users.findIndex(
          (u) => u.id === interaction.member.id
        );
        if (authorPosition === -1) {
          embed.setFooter({
            text: `${interaction.member.user.displayName} no está en el top 15.`,
            iconURL: interaction.member.user.displayAvatarURL(),
          });
        }
      } else {
        embed.setDescription("Aún no hay jugadores con puntos MVP.");
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al recuperar los puntos MVP:", error);
      await interaction.reply("Hubo un error al recuperar los datos de MVP.");
    }
  },
});
