const { ChatCommand } = require("../../utils/commands");
const { ApplicationCommandOptionType } = require("discord.js");


let {juegosEnCanal} = require("../../commands/among_us/game")

module.exports = ChatCommand({
  name: "añadir",
  description: "Permite añadir un jugador al juego en curso",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "El usuario que quieres añadir al juego",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const jugadorId = interaction.options.getUser("usuario").id;
    const canalId = interaction.channelId;

    const allowedChannels = ["1183301384133693480"];

     
     if (!allowedChannels.includes(canalId)) {
      return interaction.reply({
        content: "Este comando solo se puede usar en canales específicos <#1183301384133693480>.",
        ephemeral: true,
      });
    }


    
    if (!juegosEnCanal[canalId]) {
      return interaction.reply({
        content: "No hay un juego activo en este canal.",
        ephemeral: true,
      });
    }
    console.log(juegosEnCanal[canalId].creador);
    console.log(juegosEnCanal);
    
    if (interaction.user.id !== juegosEnCanal[canalId].creador) {
      return interaction.reply({
        content: "Solo el creador del juego puede añadir jugadores.",
        ephemeral: true,
      });
    }

    
    juegosEnCanal[canalId].jugadores.push(jugadorId);

    return interaction.reply({
      content: `El jugador <@${jugadorId}> ha sido añadido al juego.`,
      ephemeral: true,
    });
  },
});
