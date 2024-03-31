const { Button } = require("../../utils/components");
const { MatchModel } = require("../../../lib/models/schema");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  formatEmoji,
} = require("discord.js");

module.exports = Button({
  customId: "next_page",
  async execute(client, interaction) {
    const currentPage = parseInt(
      interaction.message.embeds[0].footer.text.match(/Página (\d+) de (\d+)/)[1]
    );
    const userId = interaction.message.embeds[0].author.iconURL.match(/avatars\/(\d+)\//)[1];

    
    const totalMatches = await MatchModel.countDocuments({ participants: userId });
    const maxPages = 10;
    const itemsPerPage = 3;
    const totalPages = Math.min(maxPages, Math.ceil(totalMatches / itemsPerPage));

    if (currentPage >= totalPages) return;

    const nextPage = currentPage + 1;

    // Obtener las partidas del usuario con paginación
    const matches = await MatchModel.find({ participants: userId })
      .sort({ date: -1 })
      .skip((nextPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const user = await client.users.fetch(userId);

    const embed = new EmbedBuilder()
      .setTitle(`Historial de partidas de ${user.username}`)
      .setColor("Blue")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: `Página ${nextPage} de ${totalPages}` });

    matches.forEach((match) => {
      
      const userWon = match.winner === (match.crewmates.includes(userId) ? "tripulantes" : "impostores");
      const result = userWon ? "Ganada" : "Perdida";
      const role = match.crewmates.includes(userId) ? "Tripulante" : "Impostor";
      const formattedDate = new Date(match.date).toLocaleDateString("es-ES");

      embed.addFields(
        { name: `Partida ID:`, value: `\`${match.matchId}\``, inline: true },
        { name: `Fecha: ${formattedDate}`, value: `Crew: ${formatEmoji("1170471852708212746")} \`${match.crewmates.length}\` ${formatEmoji("1170464545010098187")} \`${match.impostors.length}\``, inline: true },
        { name: "Resultado", value: `\`${result} de ${role}\``, inline: true }
      );

    });

    const updatedRow = new ActionRowBuilder();
    
    // Botón "Anterior"
    updatedRow.addComponents(
      new ButtonBuilder()
        .setCustomId("previous_page")
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextPage <= 1)
    );

    // Botón "Siguiente"
    updatedRow.addComponents(
      new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextPage >= totalPages)
    );

    await interaction.editReply({ embeds: [embed], components: [updatedRow] });
  },
});
