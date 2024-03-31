const { ChatCommand } = require("../../utils/commands");
const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const {
  UserModel,
  CodenamesUserModel,
  CodenamesMatchModel,
  MatchModel,
} = require("../../../lib/models/schema");

// Configuración de Webhooks
const webHookTest = new WebhookClient({
  url: "https://discord.com/api/webhooks/1178145770998878280/PAcMxG0tIAHkaAU6-60EfOhmugEn8lTbCd-vOr5tjpx9u3MV9B10aH2_dg0Rf6A-lqug",
});
const webHookTest2 = new WebhookClient({
  url: "https://discord.com/api/webhooks/1192232841875034173/ZkfCuB8hWVAb5xGsBWtV-3yciEEU43r-Rj9_GctUiDKk_QLotHkbudiS6BqBsDtSb9g2",
});

module.exports = ChatCommand({
  name: "criticar",
  description: "Criticar a un jugador con el que jugaste recientemente",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "juego",
      description: "El juego para el que estás criticando",
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
    {
      type: ApplicationCommandOptionType.User,
      name: "usuario",
      description: "Usuario que deseas criticar",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "razon",
      description: "Razón de la crítica",
      required: true,
    },
  ],

  async execute(client, interaction) {
    const targetUser = interaction.options.getUser("usuario");
    const razon = interaction.options.getString("razon");
    const user = interaction.user;
    const game = interaction.options.getString("juego");

    // Verificar si el usuario intenta valorarse a sí mismo
    if (user.id === targetUser.id) {
      return interaction.reply({
        content: "No puedes autocriticarte.",
        ephemeral: true,
      });
    }

    let userProfile, targetProfile, MatchModelSelected, commonMatches;
    if (game === "AmongUs") {
      userProfile = await UserModel.findOne({ id: user.id });
      targetProfile = await UserModel.findOne({ id: targetUser.id });
      MatchModelSelected = MatchModel;
    } else if (game === "Codenames") {
      userProfile = await CodenamesUserModel.findOne({ id: user.id });
      targetProfile = await CodenamesUserModel.findOne({ id: targetUser.id });
      MatchModelSelected = CodenamesMatchModel;
    }

    // Verificar si los perfiles existen
    if (!userProfile || !targetProfile) {
      return interaction.reply({
        content: "Perfil de usuario no encontrado.",
        ephemeral: true,
      });
    }

    // Verificar si los usuarios han jugado juntos recientemente
    commonMatches = userProfile.matches.filter((matchId) =>
      targetProfile.matches.includes(matchId)
    );
    if (commonMatches.length === 0) {
      return interaction.reply({
        content: "No has jugado recientemente con este usuario.",
        ephemeral: true,
      });
    }

    const lastMatchId = commonMatches[commonMatches.length - 1];

    
    userProfile.elogiosDados = userProfile.elogiosDados || {};

    
    let elogiosArray = userProfile.elogiosDados.get(lastMatchId) || [];

    
    if (elogiosArray.includes(targetUser.id)) {
      return interaction.reply({
        content: "Ya has criticado a este usuario en esta partida.",
        ephemeral: true,
      });
    }

    
    const embed = new EmbedBuilder()
      .setTitle("Nueva Critica 🌟")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setDescription(`${user.username} ha criticado a ${targetUser.username}.`)
      .addFields([
        { name: "Jugador Criticado", value: targetUser.username, inline: true },
        { name: "Razón", value: razon, inline: false },
      ])
      .setThumbnail(targetUser.displayAvatarURL())
      .setColor("Blue")
      .setTimestamp()
      .setFooter({
        text: "Críticas",
        iconURL: client.user.displayAvatarURL(),
      });

    webHookTest.send({ embeds: [embed] });

    
    const publicEmbed = new EmbedBuilder()
      .setTitle("Critica Recibida 🌟")
      .setDescription(`<@${targetUser.id}> ha recibido una crítica `)
      .addFields([{ name: "Razón", value: razon, inline: true }])
      .setColor("Red")
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: "Críticas",
        iconURL: client.user.displayAvatarURL(),
      });

    webHookTest2.send({ embeds: [publicEmbed] });

    return interaction.reply({
      content: "Crítica registrada con éxito.",
      ephemeral: true,
    });
  },
});
