const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  formatEmoji,
} = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { CodenamesUserModel } = require("../../../lib/models/schema");

module.exports = ChatCommand({
  name: "stats-code",
  description: "Mira tus estadisticas",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "miembro",
      description: "Mira las estadisticas del miembro.",
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

    const leagueEmojis = {
      Diamante: `${formatEmoji("1180597339812024491")}`,
      Platino: `${formatEmoji("1180597342907412501")}`,
      Oro: `${formatEmoji("1180597345017143356")}`,
      Plata: `${formatEmoji("1180597348112539698")}`,
      Bronce: `${formatEmoji("1180595911471144980")}`,
      Radiante: `${formatEmoji("1192014954618945616")}`, // Emoji para Radiante sin nivel
      "Radiante Estelar": `${formatEmoji("1192014954618945616")}`,
      "Radiante Resplandeciente": `${formatEmoji("1192014943873138719")}`,
      "Radiante Supremo": `${formatEmoji("1192014930644320309")}`,
    };

    const targetUser =
      interaction.options.getUser("miembro") ?? interaction.user;

    // Obtener el perfil del usuario desde MongoDB
    let userProfile = await CodenamesUserModel.findOne({ id: targetUser.id });

    // Verificar si se encontró un perfil
    if (!userProfile) {
      userProfile = new CodenamesUserModel({
        id: targetUser.id,
        mvpPoints: 0,
        puntos: 0,
        partidasJugadas: 0,
        partidasGanadas: {
          cantidadOperativo: 0,
          cantidadSpymaster: 0,
        },
        elogiosDados: new Map(),
        elogiosRecibidos: new Map(),
      });
      await userProfile.save();
    } else {
      // Asegurar que elogiosRecibidos sea un Map si ya existe el perfil
      userProfile.elogiosRecibidos = userProfile.elogiosRecibidos || new Map();
    }

    function calcularWinrateCode(ganadas, perdidas) {
      const jugadas = ganadas + perdidas;
      if (jugadas === 0) return 0;
      return Math.round((ganadas / jugadas) * 100);
    }

    const winrateOperativo = calcularWinrateCode(
      userProfile.partidasGanadas.cantidadOperativo,
      userProfile.partidasPerdidas.cantidadOperativo
    );
    const winrateSpymaster = calcularWinrateCode(
      userProfile.partidasGanadas.cantidadSpymaster,
      userProfile.partidasPerdidas.cantidadSpymaster
    );

    const totalPartidasJugadas =
      userProfile.partidasGanadas.cantidadOperativo +
      userProfile.partidasGanadas.cantidadSpymaster +
      userProfile.partidasPerdidas.cantidadOperativo +
      userProfile.partidasPerdidas.cantidadSpymaster;

    const winrateGeneral = calcularWinrateCode(
      userProfile.partidasGanadas.cantidadOperativo +
        userProfile.partidasGanadas.cantidadSpymaster,
      totalPartidasJugadas
    );

    const elogiosRecibidos = Object.fromEntries(userProfile.elogiosRecibidos);

    const elogiosText =
      Object.entries(elogiosRecibidos)
        .map(([categoria, details]) => {
          let count =
            typeof details === "object" ? details.get("cantidad") : details;
          return `${categoria}: \`${count}\``;
        })
        .join("\n") || "No has recibido elogios aún.";

    let leagueDisplay = userProfile.league || "No calibrado";
    let leagueEmoji = leagueEmojis[leagueDisplay] || "";

    if (userProfile.league === "Radiante") {
      leagueDisplay += `${userProfile.radiantLevel || ""}`;
      leagueEmoji =
        leagueEmojis[`Radiante ${userProfile.radiantLevel}`] ||
        leagueEmojis["Radiante"];
    }

    const codeEmoji = formatEmoji("1211349996889440286");
    const spyEmoji = formatEmoji("1211352767009005579");
    const operativeEmoji = formatEmoji("1211352803604308088");

    const embed = new EmbedBuilder()
      .setThumbnail(targetUser.displayAvatarURL())
      .setTitle(
        `${formatEmoji("1170432167910834237")} Estadísticas de ${
          targetUser.username
        }`
      )
      .setColor("Random")
      .setTimestamp()
      .setFields(
        {
          name: "Puntos",
          value: `🎖️\`${userProfile.puntos}\``,
          inline: true,
        },
        {
          name: "Liga",
          value: `${leagueEmoji} ${leagueDisplay}`,
          inline: true,
        },
        {
          name: "Partidas Jugadas",
          value: `${codeEmoji} \`${totalPartidasJugadas}\``,
          inline: false,
        },
        {
          name: "Operativo W | L",
          value: `${operativeEmoji} \`${userProfile.partidasGanadas.cantidadOperativo}\` | \`${userProfile.partidasPerdidas.cantidadOperativo}\``,
          inline: true,
        },
        {
          name: "Spymaster W | L",
          value: `${spyEmoji} \`${userProfile.partidasGanadas.cantidadSpymaster}\` | \`${userProfile.partidasPerdidas.cantidadSpymaster}\``,
          inline: true,
        },
        {
          name: "Winrate Operativo | Spymaster",
          value: `📊 \`${winrateOperativo}%\` | \`${winrateSpymaster}%\``,
          inline: false,
        },
        {
          name: "Winrate General",
          value: `📈 \`${winrateGeneral}%\``,
          inline: false,
        },
        {
          name: "MVP",
          value: `⭐ \`${userProfile.mvpPoints}\``,
          inline: false,
        },
        {
          name: "Elogios Recibidos 🏅",
          value: elogiosText,
          inline: false,
        }
      );
    await interaction.reply({ embeds: [embed] });
  },
});
