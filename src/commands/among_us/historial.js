const {
  UserModel,
  MatchModel,
  CodenamesUserModel,
  CodenamesMatchModel,
} = require("../../../lib/models/schema");
const { ChatCommand } = require("../../utils/commands");
const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  formatEmoji,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = ChatCommand({
  name: "historial",
  description: "Mira tu historial de partidas o el de un amigo",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "game",
      description: "Selecciona el juego del cual quieres ver el historial",
      required: true,
      choices: [
        {
          name: "🚀 Among Us",
          value: "AmongUs",
        },
        {
          name: "🕵️ Codenames",
          value: "Codenames",
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Usuario del cual quieres ver el historial",
      required: false,
    },
  ],
  async execute(client, interaction) {
    const allowedChannelId = "1175911160982274068"; //comandos compe
    const privilegedRoleId = "1172263693111795822";

    
    const hasPrivilegedRole =
      interaction.member.roles.cache.has(privilegedRoleId);

    // Verificar si el comando se está ejecutando en el canal correcto o si el usuario tiene el rol privilegiado
    if (!hasPrivilegedRole && interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: `Este comando solo se puede usar en el canal <#${allowedChannelId}> por usuarios sin el rol especial.`,
        ephemeral: true,
      });
    }

    const targetUser =
      interaction.options.getUser("usuario") ?? interaction.user;
    const game = interaction.options.getString("game");

    // Configuración de paginación
    const itemsPerPage = 3;
    const page = 1; // Esta es la página inicial

    if (game === "AmongUs") {
      
      const userProfile = await UserModel.findOne({ id: targetUser.id });
      if (!userProfile || !userProfile.partidasJugadas) {
        return interaction.reply("No hay historial de partidas para mostrar.");
      }

      
      const matches = await MatchModel.find({ participants: targetUser.id })
        .sort({ date: -1 }) 
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);

      const totalMatches = await MatchModel.countDocuments({
        participants: targetUser.id,
      });
      const totalPages = Math.ceil(totalMatches / itemsPerPage);

      if (matches.length === 0) {
        return interaction.reply("No hay partidas recientes para mostrar.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`Historial de partidas de ${targetUser.username}`)
        .setColor("Blue")
        .setAuthor({
          name: targetUser.username,
          iconURL: targetUser.displayAvatarURL(),
        })
        .setTimestamp()
        .setFooter({ text: `Página ${page} de ${totalPages}` });

      matches.forEach((match) => {
        const userWon =
          match.winner ===
          (match.crewmates.includes(targetUser.id)
            ? "tripulantes"
            : "impostores");
        const result = userWon ? "Ganada" : "Perdida";
        const role = match.crewmates.includes(targetUser.id)
          ? "Tripulante"
          : "Impostor";
        const formattedDate = new Date(match.date).toLocaleDateString("es-ES");

        embed.addFields(
          { name: `Partida ID:`, value: `\`${match.matchId}\``, inline: true },
          {
            name: `Fecha: ${formattedDate}`,
            value: `Crew: ${formatEmoji("1170471852708212746")} \`${
              match.crewmates.length
            }\` ${formatEmoji("1170464545010098187")} \`${
              match.impostors.length
            }\``,
            inline: true,
          },
          { name: "Resultado", value: `\`${result} de ${role}\``, inline: true }
        );
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`previous_page`)
          .setLabel("Anterior")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId(`next_page`)
          .setLabel("Siguiente")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= totalPages)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } else if (game === "Codenames") {
      
      const userProfile = await CodenamesUserModel.findOne({
        id: targetUser.id,
      });
      if (!userProfile || !userProfile.partidasJugadas) {
        return interaction.reply("No hay historial de partidas para mostrar.");
      }

      
      const matches = await CodenamesMatchModel.find({
        participants: targetUser.id,
      })
        .sort({ createdAt: -1 }) 
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);

      const totalMatches = await CodenamesMatchModel.countDocuments({
        participants: targetUser.id,
      });
      const totalPages = Math.ceil(totalMatches / itemsPerPage);
      const spyEmoji = formatEmoji("1211352767009005579");
      const operativeEmoji = formatEmoji("1211352803604308088");

      if (matches.length === 0) {
        return interaction.reply("No hay partidas recientes para mostrar.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`Historial de partidas de Codenames`)
        .setColor("Random")
        .setAuthor({
          name: targetUser.username,
          iconURL: targetUser.displayAvatarURL(),
        })
        .setTimestamp()
        .setFooter({ text: `Página ${page} de ${totalPages}` });

      
      matches.forEach((match) => {
        const userTeam = match.teams.red.includes(targetUser.id)
          ? "Rojo"
          : "Azul";
        const userRole =
          match.spyMasters.red === targetUser.id ||
          match.spyMasters.blue === targetUser.id
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
          match.score.red > match.score.blue
            ? match.score.red
            : match.score.blue;
        const scoreLose =
          match.score.red > match.score.blue
            ? match.score.blue
            : match.score.red;

        const teamLose = match.winner === "red" ? "Azul" : "Rojo";
        const teamWin = match.winner === "red" ? "Rojo" : "Azul";
        embed.addFields(
          { name: `Partida ID:`, value: `\`${match.matchId}\``, inline: true },
          {
            name: `Fecha: ${formattedDate}`,
            value: `Score:  \`${
              teamWin === "Rojo" ? "🟥" : "🟦"
            } ${scoreWin} - ${scoreLose} ${
              teamLose === "Rojo" ? "🟥" : "🟦"
            }\``,
            inline: true,
          },
          {
            name: "Resultado",
            value: `\`${result} de ${userRole}\``,
            inline: true,
          }
        );
      });

      // Crear botones de paginación
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`previous_page_codenames`)
          .setLabel("Anterior")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId(`next_page_codenames`)
          .setLabel("Siguiente")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= totalPages)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  },
});
