const { Button } = require("../../utils/components");
const { CodenamesMatchModel } = require("../../../lib/models/schema");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  formatEmoji,
} = require("discord.js");

module.exports = Button({
  customId: "next_page_codenames",
  async execute(client, interaction) {
    const currentPage = parseInt(
      interaction.message.embeds[0].footer.text.match(
        /Página (\d+) de (\d+)/
      )[1]
    );
    const userId =
      interaction.message.embeds[0].author.iconURL.match(/avatars\/(\d+)\//)[1];

    // Calcular el total de partidas y páginas
    const totalMatches = await CodenamesMatchModel.countDocuments({
      participants: userId,
    });
    const maxPages = 10;
    const itemsPerPage = 3;
    const totalPages = Math.min(
      maxPages,
      Math.ceil(totalMatches / itemsPerPage)
    );

    if (currentPage >= totalPages) return;

    const nextPage = currentPage + 1;

    // Obtener las partidas del usuario con paginación
    const matches = await CodenamesMatchModel.find({ participants: userId })
      .sort({ date: -1 })
      .skip((nextPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const user = await client.users.fetch(userId);

    const embed = new EmbedBuilder()
      .setTitle(`Historial de partidas de Codenames`)
      .setColor("Random")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: `Página ${nextPage} de ${totalPages}` });

    matches.forEach((match) => {
      const userTeam = match.teams.red.includes(userId) ? "Rojo" : "Azul";
      const userRole =
        match.spyMasters.red === userId || match.spyMasters.blue === userId
          ? "Spymaster"
          : "Operativo";
      const result =
        (match.winner === "red" && userTeam === "Rojo") ||
        (match.winner === "blue" && userTeam === "Azul")
          ? "Ganada"
          : "Perdida";
      const formattedDate = new Date(match.createdAt).toLocaleDateString(
        "es-ES"
      );
      const scoreWin =
        match.score.red > match.score.blue ? match.score.red : match.score.blue;
      const scoreLose =
        match.score.red < match.score.blue ? match.score.blue : match.score.red;

      const teamLose = match.winner === "red" ? "Azul" : "Rojo";
      const teamWin = match.winner === "red" ? "Rojo" : "Azul";
      embed.addFields(
        { name: `Partida ID:`, value: `\`${match.matchId}\``, inline: true },
        {
          name: `Fecha: ${formattedDate}`,
          value: `Score:  \`${
            teamWin === "Rojo" ? "🟥" : "🟦"
          } ${scoreWin} - ${scoreLose} ${teamLose === "Rojo" ? "🟥" : "🟦"}\``,
          inline: true,
        },
        {
          name: "Resultado",
          value: `\`${result} de ${userRole}\``,
          inline: true,
        }
      );
    });

    const updatedRow = new ActionRowBuilder();

    // Botón "Anterior"
    updatedRow.addComponents(
      new ButtonBuilder()
        .setCustomId("previous_page_codenames")
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextPage <= 1)
    );

    // Botón "Siguiente"
    updatedRow.addComponents(
      new ButtonBuilder()
        .setCustomId("next_page_codenames")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(nextPage >= totalPages)
    );

    await interaction.editReply({ embeds: [embed], components: [updatedRow] });
  },
});
