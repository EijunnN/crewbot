const { ChatCommand } = require("../../utils/commands");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { gameQueues, ADMIN_ROLE_IDS, SPECIAL_CHANNEL_ID } = require("../../core/functions/queue");

module.exports = ChatCommand({
  name: "close",
  description: "Cierra una cola de búsqueda de partidas",
  options: [
    {
      name: "juego",
      type: ApplicationCommandOptionType.String,
      description: "Elige el juego cuya cola quieres cerrar",
      required: true,
      choices: [
        { name: "Among Us", value: "AmongUs" },
        { name: "Codenames", value: "Codenames" }
      ]
    },
    {
      name: "numero-cola",
      type: ApplicationCommandOptionType.Integer,
      description: "Número de la cola que quieres cerrar",
      required: true
    }
  ],
  async execute(client, interaction) {
    const game = interaction.options.getString("juego");
    const queueNumber = interaction.options.getInteger("numero-cola") - 1;
    const userId = interaction.user.id;

    if (!gameQueues[game][queueNumber]) {
      return interaction.reply({ content: `No existe la cola #${queueNumber + 1} para ${game}.`, ephemeral: true });
    }

    const queue = gameQueues[game][queueNumber];
    const isAdmin = interaction.member.roles.cache.some(role => ADMIN_ROLE_IDS.includes(role.id));
    const isQueueStarter = queue[0]?.id === userId && queue[0]?.canCloseQueue;

    if (!isAdmin || !isQueueStarter) {
      return interaction.reply({ content: "No tienes permiso para cerrar esta cola.", ephemeral: true });
    }

    gameQueues[game].splice(queueNumber, 1);
    await updateClosedQueueEmbed(client, game, queueNumber + 1);

    interaction.reply({ content: `La cola #${queueNumber + 1} de ${game} ha sido cerrada.`, ephemeral: true });
  }
});

async function updateClosedQueueEmbed(client, game, queueNumber) {
  const channel = await client.channels.fetch(SPECIAL_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`Cola de ${game} #${queueNumber}`)
    .setColor("Red")
    .setDescription("Esta cola ha sido cerrada.")
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}