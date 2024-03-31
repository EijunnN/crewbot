const { ChatCommand } = require("../../utils/commands");
const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const { UserModel, CodenamesUserModel } = require("../../../lib/models/schema");

const webHookTest2 = new WebhookClient({
  url: "https://discord.com/api/webhooks/1178767457725452400/niITBgMFtYPj7lb8UtXAIpQyUN5ql5ltavlj7YAMbCKuZ9BIHkDqzbbZpQtsV5JIhxTT",
});

// const webHookTest3 = new WebhookClient({
//   url: "https://discord.com/api/webhooks/1175622958547488819/_c0WRUMAExOYsjk0K_Gzqr5ovctBkYRitFanVQV-w-PP5HWRUVb_RYIqDD3ln0A3qN_B",
// });

const categoriesByGame = {
  AmongUs: [
    "Buen Análisis",
    "Actitud Positiva",
    "Buenas Kills",
    "Buen Descarte",
    "Buena Defensa",
  ],
  Codenames: [
    "Buenas Pistas",
    "Juego en Equipo",
    "Buen Acierto",
    "Actitud Positiva",
  ],
};

const combinedCategories = [
  ...new Set([...categoriesByGame.AmongUs, ...categoriesByGame.Codenames]),
];

module.exports = ChatCommand({
  name: "elogiar",
  description: "Elogia a un jugador con el que jugaste recientemente",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Usuario que deseas elogiar",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "juego",
      description: "Juego en el que deseas elogiar",
      required: true,
      choices: [
        {
          name: "Among Us",
          value: "AmongUs",
        },
        {
          name: "Codenames",
          value: "Codenames",
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "categoria",
      description: "La categoría del elogio",
      required: true,
      choices: combinedCategories.map((category) => ({
        name: category,
        value: category,
      })),
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "razon",
      description: "Razón del elogio",
      required: false,
    },
  ],

  async execute(client, interaction) {
    const targetUser = interaction.options.getUser("usuario");
    const categoriaElogio = interaction.options.getString("categoria");
    const razonElogio =
      interaction.options.getString("razon") || "No especificada";
    const user = interaction.user;

    let Model;
    const game = interaction.options.getString("juego");
    switch (game) {
      case "AmongUs":
        Model = UserModel;
        break;
      case "Codenames":
        Model = CodenamesUserModel;
        break;
      default:
        return interaction.reply({
          content: "Juego no soportado.",
          ephemeral: true,
        });
    }

    if (user.id === targetUser.id) {
      return interaction.reply({
        content: "No puedes elogiarte a ti mismo.",
        ephemeral: true,
      });
    }

    if (!categoriesByGame[game].includes(categoriaElogio)) {
      return interaction.reply({
        content: `La categoría "${categoriaElogio}" no es válida para el juego ${game}. Por favor, selecciona una categoría válida según el juego.`,
        ephemeral: true,
      });
    }

    let userProfile = await Model.findOne({ id: user.id });
    let targetProfile = await Model.findOne({ id: targetUser.id });

    if (!userProfile || !targetProfile) {
      return interaction.reply("Perfil de usuario no encontrado.");
    }

    const commonMatches = userProfile.matches.filter((matchId) =>
      targetProfile.matches.includes(matchId)
    );
    if (commonMatches.length === 0) {
      return interaction.reply("No has jugado recientemente con este usuario.");
    }

    const lastMatchId = commonMatches[commonMatches.length - 1];

    userProfile.elogiosDados = userProfile.elogiosDados || {};

    let elogiosArray = userProfile.elogiosDados.get(lastMatchId) || [];

    if (elogiosArray.includes(targetUser.id)) {
      return interaction.reply({
        content: "Ya has elogiado a este usuario en esta partida.",
        ephemeral: true,
      });
    }

    if (!elogiosArray.includes(targetUser.id)) {
      elogiosArray.push(targetUser.id);
    }
    userProfile.elogiosDados.set(lastMatchId, elogiosArray);
    await userProfile.save();

    targetProfile.elogiosRecibidos =
      targetProfile.elogiosRecibidos || new Map();

    // Comprobar si ya existe una entrada para la categoría de elogio y actualizarla
    if (!targetProfile.elogiosRecibidos.has(categoriaElogio)) {
      targetProfile.elogiosRecibidos.set(categoriaElogio, { cantidad: 0 });
    }

    let categoria = targetProfile.elogiosRecibidos.get(categoriaElogio);
    categoria.cantidad += 1;
    targetProfile.elogiosRecibidos.set(categoriaElogio, categoria);

    await targetProfile.save();

    // Notificación vía Webhooks
    const embed = new EmbedBuilder()
      .setTitle("Nuevo Elogio Registrado 🌟")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setDescription(`${user.username} ha elogiado a ${targetUser.username}.`)
      .addFields([
        { name: "Jugador Elogiado", value: targetUser.username, inline: true },
        { name: "Juego", value: game, inline: true },
        { name: "Categoría del Elogio", value: categoriaElogio, inline: true },
        { name: "Razón del Elogio", value: razonElogio, inline: false },
        { name: "Partida ID", value: lastMatchId, inline: false },
      ])
      .setThumbnail(targetUser.displayAvatarURL())
      .setColor("#00FF00")
      .setTimestamp()
      .setFooter({
        text: "Sistema de Elogios",
        iconURL: client.user.displayAvatarURL(),
      });

    webHookTest2.send({ embeds: [embed] });
    // webHookTest3.send({ embeds: [embed] });

    return interaction.reply({
      content: "Elogio registrado con éxito.",
      ephemeral: true,
    });
  },
});
