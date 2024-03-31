const { ChatCommand } = require("../../utils/commands");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");


let juegosEnCanal = {};

module.exports = ChatCommand({
  name: "repara",
  description:
    "Juega a adivinar el código y así desactivar el sabotaje en grupo",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "numero",
      description: "Tu intento para adivinar el código",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "dificultad",
      description: "Elige el nivel de dificultad: fácil, normal o difícil",
      required: false,
      choices: [
        { name: "Fácil - 3 dígitos", value: "facil" },
        { name: "Normal - 4 dígitos", value: "normal" },
        { name: "Difícil - 5 dígitos", value: "dificil" },
      ],
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "historial",
      description: "Ver el historial de intentos del juego actual",
      required: false,
    },
  ],
  async execute(client, interaction) {
    const canalId = interaction.channelId;
    const dificultad = interaction.options.getString("dificultad");
    const intento = interaction.options.getString("numero");
    const verHistorial = interaction.options.getBoolean("historial");

    const allowedChannels = ["1183301384133693480"];

     
     if (!allowedChannels.includes(canalId)) {
      return interaction.reply({
        content: "Este comando solo se puede usar en canales específicos <#1183301384133693480>.",
        ephemeral: true,
      });
    }

    
    if (
      juegosEnCanal[canalId] &&
      dificultad &&
      juegosEnCanal[canalId].dificultad !== dificultad
    ) {
      return interaction.reply({
        content:
          "Ya hay un juego en curso con una dificultad establecida. No puedes cambiar la dificultad en medio del juego.",
        ephemeral: true,
      });
    }

    
    if (!juegosEnCanal[canalId] && dificultad) {
      juegosEnCanal[canalId] = {
        numeroSecreto: generarNumeroSecreto(dificultad),
        intentos: [],
        maxIntentos: 10,
        dificultad: dificultad,
        creador: interaction.user.id, 
        jugadores: [interaction.user.id], 
      };

      let embedNuevoJuego = new EmbedBuilder()
        .setTitle("Descubre a los impostores")
        .setDescription(
          "¡El sabotaje de oxígeno ha sido activado!\nIntenta adivinar el código para desactivarlo.\nDificultad: " +
            dificultad +
            "\nNúmero de dígitos: " +
            juegosEnCanal[canalId].numeroSecreto.length
        )
        .setColor("#0099ff")
        .setTimestamp();

      return interaction.reply({ embeds: [embedNuevoJuego] });
    }

    
    if (juegosEnCanal[canalId] && intento) {
      // Verificar si el usuario es uno de los jugadores autorizados
      if (!juegosEnCanal[canalId].jugadores.includes(interaction.user.id)) {
        return interaction.reply({
          content: "No tienes permiso para participar en este juego.",
          ephemeral: true,
        });
      }

      const longitudPermitida = juegosEnCanal[canalId].numeroSecreto.length;
      if (intento.length !== longitudPermitida) {
        return interaction.reply({
          content: `El intento debe tener exactamente ${longitudPermitida} dígitos para la dificultad seleccionada.`,
          ephemeral: true,
        });
      }

      if (new Set(intento).size !== intento.length) {
        return interaction.reply({
          content:
            "Cada dígito en tu intento debe ser único. Por favor, intenta de nuevo sin repetir dígitos.",
          ephemeral: true,
        });
      }

      juegosEnCanal[canalId].intentos.push({
        userId: interaction.user.id,
        intento: intento,
      });

      const resultado = evaluarIntento(
        juegosEnCanal[canalId].numeroSecreto,
        intento
      );

      let embedIntento = new EmbedBuilder()
        .setTitle(`Intento ${juegosEnCanal[canalId].intentos.length}`)
        .setDescription(
          `Número: ${intento}\nUsuario: <@${interaction.user.id}>`
        )
        .addFields(
          {
            name: "Impostores",
            value: `${resultado.impDescubiertos}`,
            inline: true,
          },
          {
            name: "Sospechosos",
            value: `${resultado.sospechosos}`,
            inline: true,
          }
        )
        .setColor("#0099ff")
        .setTimestamp();

      if (
        resultado.impDescubiertos ===
        juegosEnCanal[canalId].numeroSecreto.length
      ) {
        embedIntento.addFields({
          name: "Resultado",
          value: "¡Felicidades! Has desactivado el sabotaje.",
        });
        delete juegosEnCanal[canalId];
        await interaction.reply({ embeds: [embedIntento] });
        return;
      }

      
      if (
        juegosEnCanal[canalId].intentos.length >=
        juegosEnCanal[canalId].maxIntentos
      ) {
        let embedDerrota = new EmbedBuilder()
          .setTitle("Juego terminado")
          .setDescription(
            `Has alcanzado el máximo de intentos. El código era: ${juegosEnCanal[canalId].numeroSecreto}`
          )
          .setColor("#ff0000")
          .setTimestamp();

        delete juegosEnCanal[canalId];
        await interaction.reply({ embeds: [embedDerrota] });
        return;
      }

      await interaction.reply({ embeds: [embedIntento] });
    } else if (verHistorial) {
      // Manejo de historial de intentos
      if (
        !juegosEnCanal[canalId] ||
        juegosEnCanal[canalId].intentos.length === 0
      ) {
        return interaction.reply({
          content: "No hay un historial de intentos en este juego aún.",
          ephemeral: true,
        });
      }

      let embedHistorial = new EmbedBuilder()
        .setTitle("Historial de intentos")
        .setColor("#0099ff")
        .setTimestamp();

      // Mostrar solo los últimos 10 intentos
      const ultimosIntentos = juegosEnCanal[canalId].intentos.slice(-10);
      ultimosIntentos.forEach(({ userId, intento }) => {
        const resultado = evaluarIntento(
          juegosEnCanal[canalId].numeroSecreto,
          intento
        );
        embedHistorial.addFields({
          name: `Número ${intento}`,
          value: `Realizado por <@${userId}> - ${resultado.impDescubiertos} Impostores - ${resultado.sospechosos} Sospechosos`,
          inline: false,
        });
      });

      return interaction.reply({ embeds: [embedHistorial] });
    } else {
      return interaction.reply({
        content: "Por favor, inicia un juego o envía un intento.",
        ephemeral: true,
      });
    }
  },
});

function generarNumeroSecreto(dificultad) {
  let numeros = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let longitud = dificultad === "facil" ? 3 : dificultad === "dificil" ? 5 : 4;
  let numeroSecreto = "";
  for (let i = 0; i < longitud; i++) {
    let indiceAleatorio = Math.floor(Math.random() * numeros.length);
    numeroSecreto += numeros.splice(indiceAleatorio, 1)[0];
  }
  return numeroSecreto;
}

function evaluarIntento(numeroSecreto, intento) {
  let impDescubiertos = 0;
  let sospechosos = 0;
  for (let i = 0; i < intento.length; i++) {
    if (numeroSecreto[i] === intento[i]) {
      impDescubiertos++;
    } else if (numeroSecreto.includes(intento[i])) {
      sospechosos++;
    }
  }
  return { impDescubiertos, sospechosos };
}


module.exports.juegosEnCanal = juegosEnCanal;