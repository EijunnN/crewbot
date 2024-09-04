// const { ChatCommand } = require("../../utils/commands");
// const { ApplicationCommandOptionType } = require("discord.js");
// const { UserModel } = require("../../../lib/models/schema");
// const { gameQueues, QUEUE_LIMITS, updateQueueEmbed } = require("../../core/functions/queue")

// module.exports = ChatCommand({
//   name: "join",
//   description: "Únete a la cola para buscar una partida",
//   options: [
//     {
//       name: "juego",
//       type: ApplicationCommandOptionType.String,
//       description: "Elige el juego para alentar a otros jugadores a unirse a la cola",
//       required: true,
//       choices: [
//         { name: "Among Us", value: "AmongUs" },
//         { name: "Codenames", value: "Codenames" }
//       ]
//     }
//   ],
//   async execute(client, interaction) {
//     const game = interaction.options.getString("juego");
//     const userId = interaction.user.id;

//     // Verificar si el usuario ya está en alguna cola
//     for (const [queueGame, queues] of Object.entries(gameQueues)) {
//       for (const queue of queues) {
//         if (queue.some(player => player.id === userId)) {
//           return interaction.reply({ content: `Ya estás en una cola de ${queueGame}. Usa /salir-cola para salir.`, ephemeral: true });
//         }
//       }
//     }

//     let targetQueue;
//     let queueNumber = gameQueues[game].length + 1;
//     if (gameQueues[game].length === 0 || gameQueues[game][gameQueues[game].length - 1].length >= QUEUE_LIMITS[game]) {
//       // Crear una nueva cola si todas las colas existentes están llenas
//       targetQueue = [];
//       gameQueues[game].push(targetQueue);
//     } else {
//       targetQueue = gameQueues[game][gameQueues[game].length - 1];
//       queueNumber = gameQueues[game].length;
//     }

//     const userProfile = await getUserProfile(userId);
//     const queuePosition = targetQueue.length + 1;
//     const isFirstPlayer = targetQueue.length === 0;

//     targetQueue.push({
//       id: userId,
//       username: interaction.user.username,
//       joinTime: Date.now(),
//       points: userProfile.puntos,
//       league: userProfile.league || "No calificado",
//       canCloseQueue: isFirstPlayer
//     });

//     await updateQueueEmbed(client, game, queueNumber);
    
//     let replyContent = `Te has unido a la cola #${queueNumber} de ${game} en la posición ${queuePosition}.`;
//     if (isFirstPlayer) {
//       replyContent += " Como eres el primero en la cola, tienes permiso para cerrarla si es necesario.";
//     }

//     interaction.reply({ content: replyContent, ephemeral: true });
//   }
// });

// async function getUserProfile(userId) {
//   let userProfile = await UserModel.findOne({ id: userId });
//   if (!userProfile) {
//     userProfile = new UserModel({ id: userId });
//     await userProfile.save();
//   }
//   return userProfile;
// }


const { ChatCommand } = require("../../utils/commands");
const { ApplicationCommandOptionType } = require("discord.js");
const { UserModel } = require("../../../lib/models/schema");
const { gameQueues, QUEUE_LIMITS, updateQueueEmbed, getJoinInstructions } = require("../../core/functions/queue");

module.exports = ChatCommand({
  name: "join",
  description: "Únete a la cola para buscar una partida",
  options: [
    {
      name: "juego",
      type: ApplicationCommandOptionType.String,
      description: "Elige el juego para unirte a la cola",
      required: true,
      choices: [
        { name: "Among Us", value: "AmongUs" },
        { name: "Codenames", value: "Codenames" }
      ]
    }
  ],
  async execute(client, interaction) {
    const game = interaction.options.getString("juego");
    const userId = interaction.user.id;

    // Check if user is already in a queue
    for (const [queueGame, queues] of Object.entries(gameQueues)) {
      for (const queue of queues) {
        if (queue.some(player => player.id === userId)) {
          return interaction.reply({ content: `Ya estás en una cola de ${queueGame}. Usa /salir-cola para salir.`, ephemeral: true });
        }
      }
    }

    let targetQueue;
    let queueNumber = gameQueues[game].length + 1;
    if (gameQueues[game].length === 0 || gameQueues[game][gameQueues[game].length - 1].length >= QUEUE_LIMITS[game]) {
      targetQueue = [];
      gameQueues[game].push(targetQueue);
    } else {
      targetQueue = gameQueues[game][gameQueues[game].length - 1];
      queueNumber = gameQueues[game].length;
    }

    const userProfile = await getUserProfile(userId);
    const queuePosition = targetQueue.length + 1;
    const isFirstPlayer = targetQueue.length === 0;

    targetQueue.push({
      id: userId,
      username: interaction.user.username,
      joinTime: Date.now(),
      points: userProfile.puntos,
      league: userProfile.league || "✅",
      canCloseQueue: isFirstPlayer
    });

    await updateQueueEmbed(client, game, queueNumber);
    
    let replyContent = `¡Te has unido exitosamente a la cola #${queueNumber} de ${game} en la posición ${queuePosition}!`;
    if (isFirstPlayer) {
      replyContent += "\n\nComo eres el primero en la cola, tienes permiso para cerrarla si es necesario usando el comando `/cerrar-cola`.";
    }
    
    replyContent += `\n\n${getJoinInstructions(game)}`;

    interaction.reply({ content: replyContent, ephemeral: true });
  }
});

async function getUserProfile(userId) {
  let userProfile = await UserModel.findOne({ id: userId });
  if (!userProfile) {
    userProfile = new UserModel({ id: userId });
    await userProfile.save();
  }
  return userProfile;
}