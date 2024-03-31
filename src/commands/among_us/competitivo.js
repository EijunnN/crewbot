const { EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");

module.exports = ChatCommand({
  name: "competitivo",
  nameLocalizations: {
    "en-US": "competitive",
  },
  description:
    "¡Conviértete en el mejor entre los mejores en nuestro modo competitivo de Among Us!",
  descriptionLocalizations: {
    "en-US": "Become the best of the best in our Among Us competitive mode!",
  },

  async execute(client, interaction) {
    
    const guild = interaction.guild;
    const serverImageURL = guild.iconURL();

    
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Among Us Competitive", iconURL: serverImageURL })
      //
      .setTitle("¡Modo competitivo de Among Us y Codenames en Nuestro Servidor!")
      .setDescription(
        "¡Conviértete en el mejor entre los mejores en nuestro modo competitivo de Among Us y Codenames!"
      )
      .addFields(
        {
          name: "/historial",
          value:
            "Consulta el historial de partidas tuyas o de otro usuario. Muestra las últimas partidas jugadas, incluyendo resultados y roles. Uso: `/historial [usuario]`",
        },

        {
          name: "/idpartida",
          value:
            "Proporciona detalles específicos de una partida, incluyendo fecha, duración, jugadores, y más. Necesitas el ID de la partida, para obtenerlo deberás usar el comando `/historial` y copiar el ID de la partida que deseas consultar. Uso: `/idpartida [id]`",
        },
        {
          name: "/mvp",
          value:
            "Muestra el top 10 de jugadores con más puntos MVP. Ideal para ver quiénes son los jugadores más destacados. Uso: `/mvp`",
        },
        {
          name: "/elogiar",
          value:
            "Permite elogiar a distintos jugadores pero sólo una vez por partida. Debes especificar el usuario y la categoría del elogio. Uso: `/elogiar [usuario] [categoria]`\n Parametros:\n 1.`usuario`: Especifíca el usuario de Discord que deseas elogiar. Debes seleccionar a un usuario que haya participado en la última partida que jugaron.\n 2.`categoria`: Elige la categoría del elogio que deseas otorgar. RECUERDA que, puedes elogiar a muchos jugadores de tu última partida, pero sólo puedes elogiar una vez por jugador. \n El elogiado no saber quién lo elogió, es decir que el elogio es ANONIMO. ",
        },

        {
          name: "/stats",
          value:
            "Consulta las estadísticas de un jugador, incluyendo partidas jugadas, ganadas, perdidas, puntos totales y más. Uso: `/stats [miembro]`",
        },
        {
          name: "/top",
          value:
            "Muestra el top 10 de jugadores según los puntos totales acumulados. Ideal para ver quiénes son los jugadores más activos y exitosos. Uso: `/top`",
        }
        
      
      )

      .setColor("#FF0000")
      .setTimestamp();

    
    await interaction.reply({ embeds: [embed] });
  },
});
