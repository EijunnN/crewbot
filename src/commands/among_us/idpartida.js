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
        {
          name: "Among Us",
          value: "AmongUs",
        },
        {
          name: "Codenames",
          value: "Codenames",
        },
      ],
    },
  ],
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
    const game = interaction.options.getString("game");

    const matchId = interaction.options
      .getString("matchid", true)
      .replace(/`/g, "");

    if (game === "AmongUs") {
      // Recuperar el perfil del usuario y la partida desde MongoDB
      const userProfile = await UserModel.findOne({ id: interaction.user.id });
      const match = await MatchModel.findOne({ matchId: matchId });

      if (!userProfile || !match) {
        return interaction.reply("Partida no encontrada.");
      }
      if (!match.done)
        return interaction.reply("La Partida aún no ha terminado");

      const mvpUser = match.mvpId
        ? await client.users.fetch(match.mvpId).catch(() => null)
        : null;
      const mvpUsername = mvpUser ? mvpUser.username : "No disponible";

      const fetchUsername = async (id) => {
        const user = client.users.cache.get(id);
        return user ? `<@${user.id}>` : `ID: ${id}`;
      };
      const crewmateUsernames = await Promise.all(
        match.crewmates.map(fetchUsername)
      );
      const impostorUsernames = await Promise.all(
        match.impostors.map(fetchUsername)
      );

      const ganadores =
        match.winner === "tripulantes" ? "Tripulantes" : "Impostores";
      const formattedDate = new Date(match.date).toLocaleDateString("es-ES");

      const embed = new EmbedBuilder()
        .setTitle(`Detalles de la Partida`)
        .setColor("Blue")
        .setThumbnail(
          mvpUser ? mvpUser.displayAvatarURL() : client.user.displayAvatarURL()
        )
        .addFields(
          { name: "Id de la partida", value: match.matchId },
          { name: "Fecha 📅", value: formattedDate, inline: true },
          { name: "Método de Victoria", value: match.winMethod, inline: true },
          { name: "MVP ⭐", value: mvpUsername, inline: true },
          {
            name: `Tripulantes`,
            value: crewmateUsernames.join("\n"),
            inline: false,
          },
          {
            name: `Impostores`,
            value: impostorUsernames.join("\n"),
            inline: false,
          },
          { name: "Duración ⏱️", value: match.duration, inline: true },
          {
            name: `Resultado ${formatEmoji("1178079253955350578")}`,
            value: ganadores,
            inline: true,
          }
        )
        .setFooter({ text: "Más información sobre la partida" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (game === "Codenames") {
      // Recuperar el perfil del usuario y la partida desde MongoDB
      const userProfile = await CodenamesUserModel.findOne({
        id: interaction.user.id,
      });
      const match = await CodenamesMatchModel.findOne({ matchId: matchId });

      if (!userProfile || !match) {
        return interaction.reply("Partida no encontrada.");
      }
      if (!match.done)
        return interaction.reply("La Partida aún no ha terminado");

      const mvpUser = match.mvpId
        ? await client.users.fetch(match.mvpId).catch(() => null)
        : null;
      const mvpUsername = mvpUser ? mvpUser.username : "No disponible";

      const fetchUsername = async (id) => {
        const user = client.users.cache.get(id);
        return user ? `<@${user.id}>` : `ID: ${id}`;
      };

      const operativesBlue = await Promise.all(
        match.operatives.blue.map(fetchUsername)
      );
      const operativesRed = await Promise.all(
        match.operatives.red.map(fetchUsername)
      );
      console.log(operativesBlue.join("\n"));
      console.log(operativesBlue);
      const spyMasterBlue = await fetchUsername(match.spyMasters.blue);
      const spyMasterRed = await fetchUsername(match.spyMasters.red);

      const ganadores = match.winner === "red" ? "Rojo" : "Azul";
      const formattedDate = new Date(match.createdAt).toLocaleDateString(
        "es-ES"
      );
      const formatWinMethod =
        match.winMethod === "BlackCard" ? "Tarjeta Negra" : "Todas Acertadas";

      const teamLose = match.winner === "red" ? "Azul" : "Rojo";
      const teamWin = match.winner === "red" ? "Rojo" : "Azul";

      const embed = new EmbedBuilder()
        .setTitle(`Detalles de la Partida`)
        .setColor("Random")
        .setThumbnail(
          mvpUser ? mvpUser.displayAvatarURL() : client.user.displayAvatarURL()
        )
        .addFields(
          { name: "Id de la partida", value: match.matchId, inline: true },
          { name: "Fecha 📅", value: formattedDate, inline: true },
          { name: "MVP ⭐", value: mvpUsername, inline: true },
          {
            name: `Operativos Azules`,
            value: operativesBlue.join("\n")
              ? operativesBlue.join("\n")
              : "No hay Operativos Azules",
            inline: true,
          },
          {
            name: `Operativos Rojos`,
            value: operativesRed.join("\n")
              ? operativesRed.join("\n")
              : "No hay Operativos Rojos",
            inline: true,
          },
          {
            name: " ",
            value: " ",
            inline: true,
          },
          { name: `Spymaster Azul`, value: spyMasterBlue, inline: true },
          { name: `Spymaster Rojo`, value: spyMasterRed, inline: true },
          {
            name: "Score ",
            value: `🟥 ${match.score.red} - ${match.score.blue} 🟦`,
            inline: true,
          },
          {
            name: `Resultado ${formatEmoji("1178079253955350578")}`,
            value: ganadores === "Azul" ? "Equipo Azul 🟦" : "Equipo Rojo 🟥",
            inline: true,
          },
          { name: "Método de Victoria", value: formatWinMethod, inline: true }
        )
        .setFooter({ text: "Más información sobre la partida" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
});
