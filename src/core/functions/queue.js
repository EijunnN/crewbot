// const { formatEmoji, EmbedBuilder } = require("discord.js");

// // Objeto para almacenar las colas de juego
// const gameQueues = {
//   AmongUs: [],
//   Codenames: [],
// };

// const QUEUE_LIMITS = {
//   AmongUs: 11,
//   Codenames: 10,
// };

// const SPECIAL_CHANNEL_ID = "1178778700255330435"; // Partidas competitivo
// const SPECIAL_ROLE_ID = "1166592852709609494"; // Among Us
// // const SPECIAL_CHANNEL_ID = "1182894223155003423"; // Comando Admin
// // const SPECIAL_ROLE_ID = "1176722309634080808"; // El patron

// const ADMIN_ROLE_IDS = ["1172263693111795822", "1166531316016234567"];

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

// const encouragementMessages = [
//   "¡Únete a la diversión!",
//   "¡La partida está a punto de comenzar!",
//   "¡No te quedes fuera!",
//   "¡Ven a jugar con nosotros!",
//   "¡La acción te espera!",
// ];

// function transferQueueClosingPermission(game, queueNumber) {
//   const queue = gameQueues[game][queueNumber - 1];
//   if (queue && queue.length > 0) {
//     // El primer usuario en la cola ahora tiene el permiso para cerrarla
//     queue[0].canCloseQueue = true;
//     return queue[0].username;
//   }
//   return null;
// }

// async function updateQueueEmbed(
//   client,
//   game,
//   queueNumber,
//   removedPlayerUsername = null
// ) {
//   const channel = await client.channels.fetch(SPECIAL_CHANNEL_ID);
//   if (!channel) return;

//   const queue = gameQueues[game][queueNumber - 1];
//   if (!queue) return;

//   const embed = new EmbedBuilder()
//     .setTitle(`Cola de ${game} #${queueNumber}`)
//     .setColor(removedPlayerUsername ? "Yellow" : "Green")
//     .setTimestamp();

//   const playerFields = queue.map((player, index) => {
//     const waitTime = Math.floor((Date.now() - player.joinTime) / 60000);
//     const leagueEmoji = leagueEmojis[player.league] || "";
//     return {
//       name: " ",
//       value: `${index + 1}. <@${player.id}> - \`${waitTime}min\`\n`,
//       inline: true,
//     };
//   });

//   embed
//     .addFields(playerFields)
//     .setDescription(`Jugadores: ${queue.length}/${QUEUE_LIMITS[game]}`);

//   if (removedPlayerUsername) {
//     let description = `Jugadores: ${queue.length}/${QUEUE_LIMITS[game]}\n\n${removedPlayerUsername} ha dejado la cola.`;

//     // Si el usuario que se fue era el primero en la cola, transferir el permiso
//     if (queue.length > 0 && queue[0].canCloseQueue) {
//       const newCloser = transferQueueClosingPermission(game, queueNumber);
//       if (newCloser) {
//         description += `\nEl permiso para cerrar la cola ha sido transferido a ${newCloser}.`;
//       }
//     }

//     embed.setDescription(description);
//   }

//   const encouragementMessage =
//     encouragementMessages[
//       Math.floor(Math.random() * encouragementMessages.length)
//     ];

//   const message = await channel.send({
//     content: `<@&${SPECIAL_ROLE_ID}> ${encouragementMessage}`,
//     embeds: [embed],
//   });
// }

// module.exports = {
//   gameQueues,
//   QUEUE_LIMITS,
//   SPECIAL_CHANNEL_ID,
//   SPECIAL_ROLE_ID,
//   ADMIN_ROLE_IDS,
//   leagueEmojis,
//   updateQueueEmbed,
//   transferQueueClosingPermission,
// };



const { formatEmoji, EmbedBuilder } = require("discord.js");

const gameQueues = {
  AmongUs: [],
  Codenames: [],
};

const QUEUE_LIMITS = {
  AmongUs: 11,
  Codenames: 10,
};


// const SPECIAL_CHANNEL_ID = "1182894223155003423"; // Comando Admin
// const SPECIAL_ROLE_ID = "1176722309634080808"; // El patron
const SPECIAL_CHANNEL_ID = "1178778700255330435";
const SPECIAL_ROLE_ID = "1166592852709609494";
const ADMIN_ROLE_IDS = ["1172263693111795822", "1166531316016234567"];

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

const encouragementMessages = [
  "¡Únete a la diversión!",
  "¡La partida está a punto de comenzar!",
  "¡No te quedes fuera!",
  "¡Ven a jugar con nosotros!",
  "¡La acción te espera!",
  "¡Forma parte de esta emocionante partida!",
  "¡Demuestra tus habilidades en el juego!",
  "¡Una nueva aventura está por comenzar!",
  "¡No te pierdas esta oportunidad de jugar!",
  "¡Únete y haz nuevos amigos en el juego!",
  "¡La diversión está garantizada, no te lo pierdas!",
  "¡Sé parte de esta increíble comunidad de jugadores!",
];

function getJoinInstructions(game) {
  let instructions = "Para unirte al juego, sigue estos pasos:\n";
  instructions += "1. Asegúrate de tener el juego instalado y actualizado.\n";
  
  if (game === "AmongUs") {
    instructions += "2. Abre Among Us y prepárate para unirte a una sala privada.\n";
    instructions += "3. Espera a que se complete la cola y el arbitro compartirá el código de la sala.\n";
    instructions += "4. Introduce el código en el juego para unirte a la partida.\n";
  } else if (game === "Codenames") {
    instructions += "2. El arbitro compartirá un enlace a la sala de Codenames.\n";
    instructions += "3. Haz clic en el enlace para unirte a la partida en tu navegador.\n";
    instructions += "4. Elige tu equipo y rol una vez estés en la sala.\n";
  }
  
  instructions += "5. ¡Diviértete y juega con respeto hacia todos los participantes!";
  
  return instructions;
}

function transferQueueClosingPermission(game, queueNumber) {
  const queue = gameQueues[game][queueNumber - 1];
  if (queue && queue.length > 0) {
    queue[0].canCloseQueue = true;
    return queue[0].username;
  }
  return null;
}

async function updateQueueEmbed(client, game, queueNumber, removedPlayerUsername = null) {
  const channel = await client.channels.fetch(SPECIAL_CHANNEL_ID);
  if (!channel) return;

  const queue = gameQueues[game][queueNumber - 1];
  if (!queue) return;

  const embed = new EmbedBuilder()
    .setTitle(`Cola de ${game} #${queueNumber}`)
    .setColor(removedPlayerUsername ? "Yellow" : "Green")
    .setTimestamp();

  const playerFields = queue.map((player, index) => {
    const waitTime = Math.floor((Date.now() - player.joinTime) / 60000);
    const leagueEmoji = leagueEmojis[player.league] || "";
    return {
      name: " ",
      value: `${index + 1}. <@${player.id}> - \`${waitTime}min\` ${leagueEmoji}\n`,
      inline: false,
    };
  });

  embed
    .addFields(playerFields)
    .setDescription(`Jugadores: ${queue.length}/${QUEUE_LIMITS[game]}`);

  if (removedPlayerUsername) {
    let description = `Jugadores: ${queue.length}/${QUEUE_LIMITS[game]}\n\n${removedPlayerUsername} ha dejado la cola.`;

    if (queue.length > 0 && queue[0].canCloseQueue) {
      const newCloser = transferQueueClosingPermission(game, queueNumber);
      if (newCloser) {
        description += `\nEl permiso para cerrar la cola ha sido transferido a ${newCloser}.`;
      }
    }

    embed.setDescription(description);
  }

  const encouragementMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  const message = await channel.send({
    content: `<@&${SPECIAL_ROLE_ID}> ${encouragementMessage}\n\nPara unirte a la lista, usa el comando \`/join juego:${game}\` en cualquier canal.`,
    embeds: [embed],
  });
}

module.exports = {
  gameQueues,
  QUEUE_LIMITS,
  SPECIAL_CHANNEL_ID,
  SPECIAL_ROLE_ID,
  ADMIN_ROLE_IDS,
  leagueEmojis,
  updateQueueEmbed,
  transferQueueClosingPermission,
  getJoinInstructions,
};