const {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { RestartButton } = require("../../utils/constants");
const { ChatCommand } = require("../../utils/commands");
const { MatchModel } = require("../../../lib/models/schema");
const { CodenamesMatchModel } = require("../../../lib/models/schema");
const humanizeDuration = require("humanize-duration");

module.exports = ChatCommand({
  name: "partida",
  description:
    "Finaliza una partida de Among Us o Codenames y muestra el resumen.",

  async execute(client, interaction) {
    const allowedChannelId = "1170851587162382456";

    // Verificar si el comando se está ejecutando en el canal correcto
    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content:
          "Este comando solo se puede usar en el canal <#1170851587162382456>.",
        ephemeral: true,
      });
    }

    const ephemeral = !interaction.member.roles.cache.has(process.env.ROLE_ID);
    await interaction.deferReply({ ephemeral });
    if (ephemeral) {
      return interaction.editReply({
        content: "No tienes permiso para usar este comando.",
      });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: "Debes estar en una sala de voz para usar este comando.",
      });
    }

    try {
      // await interaction.deferReply();
      // Buscar en ambas colecciones de partidas, Among Us y Codenames
      let savedMatch =
        (await MatchModel.findOne({
          channelId: voiceChannel.id,
          done: false,
        })) ||
        (await CodenamesMatchModel.findOne({
          channelId: voiceChannel.id,
          done: false,
        }));

      if (!savedMatch) {
        return interaction.editReply(
          "No se encontró una partida activa en este canal."
        );
      }

      // Determinar el juego de la partida activa y proceder en consecuencia
      if (savedMatch instanceof MatchModel) {
        // Lógica para Among Us
        return handleAmongUsMatch(interaction, savedMatch);
      } else if (savedMatch instanceof CodenamesMatchModel) {
        // Lógica para Codenames
        return handleCodenamesMatch(interaction, savedMatch);
      } else {
        return interaction.reply("Error: Tipo de partida no reconocido.");
      }
    } catch (error) {
      console.error("Error al manejar la partida:", error);
      await interaction.reply("Hubo un error al manejar la partida.");
    }
  },
});

async function handleAmongUsMatch(interaction, savedMatch) {
  // Calcular la duración de la partida
  // await interaction.deferReply();
  savedMatch.duration = humanizeDuration(Date.now() - savedMatch.createdAt, {
    language: "es",
    round: true,
  });
  await savedMatch.save();

  // Crear opciones para el menú de selección de impostores basado en los participantes de la partida
  const participantsOptions = savedMatch.participants
    .map((userId) => {
      const member = interaction.guild.members.cache.get(userId);
      return member
        ? {
            label: member.displayName,
            value: userId,
            description: member.user.username,
          }
        : null;
    })
    .filter((option) => option !== null);

  if (participantsOptions.length === 0) {
    return interaction.editReply(
      "No hay participantes válidos para seleccionar como impostores."
    );
  }

  // Crear y configurar el menú desplegable para seleccionar impostores
  const selectMenuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_impostores")
      .setPlaceholder("Selecciona a los impostores")
      .addOptions(participantsOptions)
      // Ajustar según el número máximo de impostores permitido
      .setMaxValues(savedMatch.numberOfImpostors)
  );

  // Enviar el menú desplegable al usuario
  await interaction.editReply({
    content: "Selecciona a los impostores de la partida",
    components: [selectMenuRow],
  });
}

async function handleCodenamesMatch(interaction, savedMatch) {
  // Lógica para manejar partidas de Codenames
  // await interaction.deferReply();
  savedMatch.duration = humanizeDuration(Date.now() - savedMatch.createdAt, {
    language: "es",
    round: true,
  });
  await savedMatch.save();

  const team = savedMatch.teams;

  const participantsOptions = [
    {
      label: "Rojo",
      value: "red",
      description: "Equipo rojo",
      emoji: "🟥",
    },
    {
      label: "Azul",
      value: "blue",
      description: "Equipo azul",
      emoji: "🟦",
    },
  ];

  // Crear y configurar el menú desplegable para seleccionar el equipo ganador

  const selectMenuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_team")
      .setPlaceholder("Selecciona al equipo ganador")
      .addOptions(participantsOptions)
      .setMaxValues(1)
  );

  await interaction.editReply({
    content: "Selecciona al equipo ganador",
    components: [selectMenuRow],
  });
}
