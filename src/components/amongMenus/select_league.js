const { EmbedBuilder, Emoji } = require("discord.js");
const { UserModel } = require("../../../lib/models/schema");

module.exports = {
  customId: "select_league",
  async execute(client, interaction) {
    const selectedLeague = interaction.values[0];
    const users = await UserModel.find({
      league: selectedLeague,
      puntos: { $gt: 0 },
    })
      .sort({ puntos: -1 })
      .limit(10);

    // URLs de los emojis para cada liga
    const leagueEmojis = {
      Radiante: "https://cdn.discordapp.com/emojis/1192014930644320309.png",
      Diamante: "https://cdn.discordapp.com/emojis/1180597339812024491.png",
      Platino: "https://cdn.discordapp.com/emojis/1180597342907412501.png",
      Oro: "https://cdn.discordapp.com/emojis/1180597345017143356.png",
      Plata: "https://cdn.discordapp.com/emojis/1180597348112539698.png",
      Bronce: "https://cdn.discordapp.com/emojis/1180595911471144980.png",
    };
    const embed = new EmbedBuilder()
      .setColor("Yellow")

      .setTitle(`TOP 10 en ${interaction.guild.name} - Liga ${selectedLeague}`)
      .setThumbnail(leagueEmojis[selectedLeague]);

    if (users.length > 0) {
      users.forEach((user, index) => {
        // const userName = client.users.cache.get(user.id)?.username ?? user.id;
        const userName =
          client.users.cache.get(user.id)?.displayName ?? user.id;
        embed.addFields({
          name: `${index + 1}. ${userName} | \`🎖️${user.puntos}\``,
          // value: `🎖️ Puntos totales: \`${user.puntos}\``
          value: " ",
        });
      });
    } else {
      embed.setDescription(`No hay usuarios en la Liga ${selectedLeague}.`);
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
