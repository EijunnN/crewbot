const createMatch = require("../../core/functions/createMatch");
const { ChatCommand } = require("../../utils/commands");
const { EmbedBuilder } = require("discord.js");
const {
  Match,
  MatchModel,
  CodenamesMatchModel,
} = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");
const createMatchCodenames = require("../../core/functions/codenames/createMatchCodenames");

const ROLE = "1178766244091011133";
// const ROLE = "1119771454188306472";

module.exports = ChatCommand({
  name: "iniciar",
  description: "Guarda la lista de participantes de la partida actual",
  options: [
    {
      name: "juego",
      description: "El juego para el que estás iniciando una partida",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "🚀 Among Us",
          value: "AmongUs",
        },
        {
          name: "🕵️ Codenames",
          value: "Codenames",
        },
      ],
    },
  ],

  async execute(client, interaction) {
    const game = interaction.options.getString("juego");
    const voiceChannel = interaction.member.voice.channel;
    const allowedChannelId = "1170851587162382456";

    if (!voiceChannel) {
      return interaction.reply(
        "Debes estar en una sala de voz para usar este comando."
      );
    }
    // Verificar si el comando se está ejecutando en el canal correcto
    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content:
          "Este comando solo se puede usar en el canal <#1170851587162382456>.",
        ephemeral: true,
      });
    }

    const ephemeral = !interaction.member.roles.cache.has(process.env.ROLE_ID);
    // await interaction.deferReply({ ephemeral });
    if (ephemeral) {
      return interaction.editReply({
        content: "No tienes permiso para usar este comando.",
      });
    }

    const participants = voiceChannel.members.map((member) => member.id);

    // Asignar roles a los participantes
    const promises = participants.map(async (memberId) => {
      const member = await interaction.guild.members.fetch(memberId);
      member.roles.add(ROLE).catch(console.error); // Asignar rol
    });
    await Promise.all(promises);

    const participants2 = voiceChannel.members.map((member) =>
      member.toString()
    );

    // Selecciona la función de creación de partida basada en el juego elegido
    if (game === "AmongUs") {
      const existingMatch = await MatchModel.findOne({
        channelId: voiceChannel.id,
        done: false,
      });
      if (existingMatch) {
        return interaction.reply("Ya hay una partida en curso en esta sala.");
      }
      await createMatch(client, voiceChannel.id, 2, participants);
    } else if (game === "Codenames") {
      const existingMatch = await CodenamesMatchModel.findOne({
        channelId: voiceChannel.id,
        done: false,
      });
      if (existingMatch) {
        return interaction.reply("Ya hay una partida en curso en esta sala.");
      }
      await createMatchCodenames(client, voiceChannel.id, participants);
    }

    // Crear y enviar el embed de notificación
    const embed = new EmbedBuilder()
      .setTitle(
        `⚡ ${interaction.user.username} ha iniciado una partida de ${game} en ${voiceChannel.name} ⚡`
      )
      .setDescription(
        "Se ha iniciado una partida con los siguientes jugadores:"
      )
      .addFields({
        name: "Jugadores",
        value: participants2.join("\n") || "Sin jugadores",
      })
      .setColor("#0099ff")
      .setTimestamp();

    // Enviar el embed al canal designado
    const adminChannel = client.channels.cache.get("1178147629973110844");
    adminChannel?.send({ embeds: [embed] });

    await interaction.reply(
      `Partida iniciada en la sala: ${voiceChannel.name}.`
    );
  },
});
