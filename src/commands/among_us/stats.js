// const {
//   ApplicationCommandOptionType,
//   EmbedBuilder,
//   formatEmoji,
//   GuildMember,
//   GuildMemberManager,
// } = require("discord.js");
// const { ChatCommand } = require("../../utils/commands");
// const { UserModel } = require("../../../lib/models/schema");

// const ALLOWED_CHANNEL_ID = "1175911160982274068";
// const PRIVILEGED_ROLE_ID = "1172263693111795822";

// const leagueEmojis = {
//   Diamante: formatEmoji("1180597339812024491"),
//   Platino: formatEmoji("1180597342907412501"),
//   Oro: formatEmoji("1180597345017143356"),
//   Plata: formatEmoji("1180597348112539698"),
//   Bronce: formatEmoji("1180595911471144980"),
//   Radiante: formatEmoji("1192014954618945616"),
//   "Radiante Estelar": formatEmoji("1192014954618945616"),
//   "Radiante Resplandeciente": formatEmoji("1192014943873138719"),
//   "Radiante Supremo": formatEmoji("1192014930644320309"),
// };

// module.exports = ChatCommand({
//   name: "stats",
//   description: "Mira tus estadísticas",
//   options: [
//     {
//       type: ApplicationCommandOptionType.User,
//       name: "miembro",
//       description: "Mira las estadísticas del miembro.",
//     },
//   ],
//   async execute(client, interaction) {
//     if (!canExecuteCommand(interaction)) {
//       return interaction.reply({
//         content: `Este comando solo se puede usar en el canal <#${ALLOWED_CHANNEL_ID}> por usuarios sin el rol especial.`,
//         ephemeral: true,
//       });
//     }

//     const targetUser =
//       interaction.options.getUser("miembro") ?? interaction.user;
//     const userProfile = await getUserProfile(targetUser.id);

//     const embed = createStatsEmbed(targetUser, userProfile);
//     await interaction.reply({ embeds: [embed] });
//   },
// });

// function canExecuteCommand(interaction) {
//   const hasPrivilegedRole =
//     interaction.member.roles.cache.has(PRIVILEGED_ROLE_ID);
//   return hasPrivilegedRole || interaction.channelId === ALLOWED_CHANNEL_ID;
// }

// async function getUserProfile(userId) {
//   let userProfile = await UserModel.findOne({ id: userId });
//   if (!userProfile) {
//     userProfile = new UserModel({
//       id: userId,
//       mvpPoints: 0,
//       puntos: 0,
//       partidasJugadas: 0,
//       partidasGanadas: { cantidadTripulante: 0, cantidadImpostor: 0 },
//       partidasPerdidas: { cantidadTripulante: 0, cantidadImpostor: 0 },
//       elogiosDados: new Map(),
//       elogiosRecibidos: new Map(),
//     });
//     await userProfile.save();
//   }
//   return userProfile;
// }

// function calcularWinrate(ganadas, perdidas) {
//   const jugadas = ganadas + perdidas;
//   return jugadas === 0 ? 0 : Math.round((ganadas / jugadas) * 100);
// }

// function createStatsEmbed(targetUser, userProfile) {
//   const { winrateCrew, winrateImpostor, winrateGeneral, totalPartidasJugadas } =
//     calcularWinrates(userProfile);
//   const elogiosText = formatElogios(userProfile.elogiosRecibidos);
//   const { leagueDisplay, leagueEmoji } = formatLeague(userProfile);

//   return new EmbedBuilder()
//     .setThumbnail(targetUser.displayAvatarURL())
//     .setTitle(
//       `${formatEmoji("1170432167910834237")} Estadísticas de ${
//         targetUser.username
//       }`
//     )
//     .setColor("Random")
//     .setTimestamp()
//     .addFields(
//       { name: "Puntos", value: `🎖️ \`${userProfile.puntos}\``, inline: true },
//       { name: "Liga", value: `${leagueEmoji} ${leagueDisplay}`, inline: true },
//       {
//         name: "Partidas Jugadas",
//         value: `${formatEmoji(
//           "1170427230535565392"
//         )} \`${totalPartidasJugadas}\``,
//         inline: false,
//       },
//       {
//         name: "Crew W | L",
//         value: `${formatEmoji("1170471852708212746")}\`${
//           userProfile.partidasGanadas.cantidadTripulante
//         }\` | \`${userProfile.partidasPerdidas.cantidadTripulante}\``,
//         inline: true,
//       },
//       {
//         name: "Impostor W | L",
//         value: `${formatEmoji("1170464545010098187")}\`${
//           userProfile.partidasGanadas.cantidadImpostor
//         }\` | \`${userProfile.partidasPerdidas.cantidadImpostor}\``,
//         inline: true,
//       },
//       {
//         name: "Winrate Crew | Impostor",
//         value: `📊 \`${winrateCrew} %\` | \`${winrateImpostor}%\``,
//         inline: false,
//       },
//       {
//         name: "Winrate General",
//         value: `📈 \`${winrateGeneral}%\``,
//         inline: true,
//       },
//       { name: "MVP", value: `⭐ \`${userProfile.mvpPoints}\``, inline: true },
//       { name: "Elogios Recibidos 🏅", value: elogiosText, inline: false }
//     );
// }

// function calcularWinrates(userProfile) {
//   const winrateCrew = calcularWinrate(
//     userProfile.partidasGanadas.cantidadTripulante,
//     userProfile.partidasPerdidas.cantidadTripulante
//   );
//   const winrateImpostor = calcularWinrate(
//     userProfile.partidasGanadas.cantidadImpostor,
//     userProfile.partidasPerdidas.cantidadImpostor
//   );
//   const totalPartidasJugadas =
//     userProfile.partidasGanadas.cantidadTripulante +
//     userProfile.partidasGanadas.cantidadImpostor +
//     userProfile.partidasPerdidas.cantidadTripulante +
//     userProfile.partidasPerdidas.cantidadImpostor;
//   const winrateGeneral = calcularWinrate(
//     userProfile.partidasGanadas.cantidadTripulante +
//       userProfile.partidasGanadas.cantidadImpostor,
//     totalPartidasJugadas
//   );

//   return { winrateCrew, winrateImpostor, winrateGeneral, totalPartidasJugadas };
// }

// function formatElogios(elogiosRecibidos) {
//   return (
//     Object.entries(Object.fromEntries(elogiosRecibidos))
//       .map(([categoria, details]) => {
//         let count =
//           typeof details === "object" ? details.get("cantidad") : details;
//         return `${categoria}: \`${count}\``;
//       })
//       .join("\n") || "No hay elogios recibidos"
//   );
// }

// function formatLeague(userProfile) {
//   let leagueDisplay = userProfile.league || "No calificado";
//   let leagueEmoji = leagueEmojis[userProfile.league] || "";

//   if (userProfile.league === "Radiante") {
//     leagueDisplay += ` ${userProfile.radiantLevel || ""}`;
//     leagueEmoji =
//       leagueEmojis[`Radiante ${userProfile.radiantLevel}`] ||
//       leagueEmojis["Radiante"];
//   }

//   return { leagueDisplay, leagueEmoji };
// }

const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  formatEmoji,
  GuildMember,
  GuildMemberManager,
} = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { UserModel } = require("../../../lib/models/schema");

const ALLOWED_CHANNEL_ID = "1175911160982274068";
const PRIVILEGED_ROLE_ID = "1172263693111795822";

const leagueEmojis = {
  Diamante: formatEmoji("1180597339812024491"),
  Platino: formatEmoji("1180597342907412501"),
  Oro: formatEmoji("1180597345017143356"),
  Plata: formatEmoji("1180597348112539698"),
  Bronce: formatEmoji("1180595911471144980"),
  Radiante: formatEmoji("1192014954618945616"),
  "Radiante Estelar": formatEmoji("1192014954618945616"),
  "Radiante Resplandeciente": formatEmoji("1192014943873138719"),
  "Radiante Supremo": formatEmoji("1192014930644320309"),
};

module.exports = ChatCommand({
  name: "stats",
  description: "Mira tus estadísticas",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "miembro",
      description: "Mira las estadísticas del miembro.",
    },
  ],
  async execute(client, interaction) {
    if (!canExecuteCommand(interaction)) {
      return interaction.reply({
        content: `Este comando solo se puede usar en el canal <#${ALLOWED_CHANNEL_ID}> por usuarios sin el rol especial.`,
        ephemeral: true,
      });
    }

    const targetUser =
      interaction.options.getUser("miembro") ?? interaction.user;
    const userProfile = await getUserProfile(targetUser.id);

    const embed = createStatsEmbed(targetUser, userProfile);
    await interaction.reply({ embeds: [embed] });
  },
});

function canExecuteCommand(interaction) {
  const hasPrivilegedRole =
    interaction.member.roles.cache.has(PRIVILEGED_ROLE_ID);
  return hasPrivilegedRole || interaction.channelId === ALLOWED_CHANNEL_ID;
}

async function getUserProfile(userId) {
  let userProfile = await UserModel.findOne({ id: userId });
  if (!userProfile) {
    userProfile = new UserModel({
      id: userId,
      mvpPoints: 0,
      puntos: 0,
      partidasJugadas: 0,
      partidasGanadas: { cantidadTripulante: 0, cantidadImpostor: 0 },
      partidasPerdidas: { cantidadTripulante: 0, cantidadImpostor: 0 },
      elogiosDados: new Map(),
      elogiosRecibidos: new Map(),
    });
    await userProfile.save();
  }
  return userProfile;
}

function calcularWinrate(ganadas, perdidas) {
  const jugadas = ganadas + perdidas;
  return jugadas === 0 ? 0 : Math.round((ganadas / jugadas) * 100);
}

function createStatsEmbed(targetUser, userProfile) {
  const { winrateCrew, winrateImpostor, winrateGeneral, totalPartidasJugadas } =
    calcularWinrates(userProfile);
  const elogiosText = formatElogios(userProfile.elogiosRecibidos);
  const { leagueDisplay, leagueEmoji } = formatLeague(userProfile);

  return new EmbedBuilder()
    .setThumbnail(targetUser.displayAvatarURL())
    .setTitle(
      `${formatEmoji("1170432167910834237")} Estadísticas de ${
        targetUser.username
      }`
    )
    .setColor("Random")
    .setTimestamp()
    .addFields(
      { name: "Puntos", value: `🎖️ \`${userProfile.puntos}\``, inline: true },
      { name: "Liga", value: `${leagueEmoji} ${leagueDisplay}`, inline: true },
      {
        name: "Partidas Jugadas",
        value: `${formatEmoji(
          "1170427230535565392"
        )} \`${totalPartidasJugadas}\``,
        inline: false,
      },
      {
        name: "Crew W | L",
        value: `${formatEmoji("1170471852708212746")}\`${
          userProfile.partidasGanadas.cantidadTripulante
        }\` | \`${userProfile.partidasPerdidas.cantidadTripulante}\``,
        inline: true,
      },
      {
        name: "Impostor W | L",
        value: `${formatEmoji("1170464545010098187")}\`${
          userProfile.partidasGanadas.cantidadImpostor
        }\` | \`${userProfile.partidasPerdidas.cantidadImpostor}\``,
        inline: true,
      },
      {
        name: "Winrate Crew | Impostor",
        value: `📊 \`${winrateCrew} %\` | \`${winrateImpostor}%\``,
        inline: false,
      },
      {
        name: "Winrate General",
        value: `📈 \`${winrateGeneral}%\``,
        inline: true,
      },
      { name: "MVP", value: `⭐ \`${userProfile.mvpPoints}\``, inline: true },
      { name: "Elogios Recibidos 🏅", value: elogiosText, inline: false }
    );
}

function calcularWinrates(userProfile) {
  const winrateCrew = calcularWinrate(
    userProfile.partidasGanadas.cantidadTripulante,
    userProfile.partidasPerdidas.cantidadTripulante
  );
  const winrateImpostor = calcularWinrate(
    userProfile.partidasGanadas.cantidadImpostor,
    userProfile.partidasPerdidas.cantidadImpostor
  );
  const totalPartidasJugadas =
    userProfile.partidasGanadas.cantidadTripulante +
    userProfile.partidasGanadas.cantidadImpostor +
    userProfile.partidasPerdidas.cantidadTripulante +
    userProfile.partidasPerdidas.cantidadImpostor;
  const winrateGeneral = calcularWinrate(
    userProfile.partidasGanadas.cantidadTripulante +
      userProfile.partidasGanadas.cantidadImpostor,
    totalPartidasJugadas
  );

  return { winrateCrew, winrateImpostor, winrateGeneral, totalPartidasJugadas };
}

function formatElogios(elogiosRecibidos) {
  if (!elogiosRecibidos || typeof elogiosRecibidos !== "object") {
    return "No hay elogios recibidos";
  }

  const elogiosEntries =
    elogiosRecibidos instanceof Map
      ? Array.from(elogiosRecibidos.entries())
      : Object.entries(elogiosRecibidos);

  return elogiosEntries.length > 0
    ? elogiosEntries
        .map(([categoria, details]) => {
          let count =
            typeof details === "object" && details.get
              ? details.get("cantidad")
              : typeof details === "number"
              ? details
              : 0;
          return `${categoria}: \`${count}\``;
        })
        .join("\n")
    : "No hay elogios recibidos";
}

function formatLeague(userProfile) {
  let leagueDisplay = userProfile.league || "No calificado";
  let leagueEmoji = leagueEmojis[userProfile.league] || "";

  if (userProfile.league === "Radiante") {
    leagueDisplay += ` ${userProfile.radiantLevel || ""}`;
    leagueEmoji =
      leagueEmojis[`Radiante ${userProfile.radiantLevel}`] ||
      leagueEmojis["Radiante"];
  }

  return { leagueDisplay, leagueEmoji };
}
