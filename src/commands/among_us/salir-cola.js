const { ChatCommand } = require("../../utils/commands");
const { ApplicationCommandOptionType } = require("discord.js");
const { gameQueues, updateQueueEmbed, transferQueueClosingPermission  } = require("../../core/functions/queue");

module.exports = ChatCommand({
    name: "leave",
    description: "Sal de la cola de búsqueda de partidas",
    options: [
      {
        name: "juego",
        type: ApplicationCommandOptionType.String,
        description: "Elige el juego del que quieres salir",
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
  
      let queueFound = false;
      let queueNumber = 0;
  
      for (let i = 0; i < gameQueues[game].length; i++) {
        const queue = gameQueues[game][i];
        queueNumber = i + 1;
        const playerIndex = queue.findIndex(player => player.id === userId);
        if (playerIndex !== -1) {
          const removedPlayer = queue.splice(playerIndex, 1)[0];
          queueFound = true;
  
          if (queue.length === 0) {
            // Eliminar la cola si está vacía
            gameQueues[game].splice(i, 1);
          } else {
            // Si el jugador que se fue era el primero, transferir el permiso
            if (playerIndex === 0) {
              transferQueueClosingPermission(game, queueNumber);
            }
            await updateQueueEmbed(client, game, queueNumber, removedPlayer.username);
          }
  
          break;
        }
      }
  
      if (queueFound) {
        interaction.reply({ content: `Has salido de la cola #${queueNumber} de ${game}.`, ephemeral: true });
      } else {
        interaction.reply({ content: `No estabas en ninguna cola de ${game}.`, ephemeral: true });
      }
    }
  });