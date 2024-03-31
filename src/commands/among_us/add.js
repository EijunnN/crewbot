const { ApplicationCommandOptionType } = require("discord.js");
const addPoints = require("../../core/functions/addPoints");
const { ChatCommand } = require("../../utils/commands");
const addPointsCode = require("../../core/functions/codenames/addPointsCode");

module.exports = ChatCommand({
  name: "add",
  permissions: ["Administrator"],
  description: "Agrega puntos a un usuario específico",
  options: [
    {
      name: "user",
      type: ApplicationCommandOptionType.User,
      description: "Usuario al que quieres agregar puntos",
      required: true,
    },
    {
      name: "game",
      type: ApplicationCommandOptionType.String,
      description: "Juego al que quieres agregar puntos",
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
      required: true,
    },
    {
      name: "points",
      type: ApplicationCommandOptionType.Integer,
      description: "Cantidad de puntos a agregar",
      required: true,
    },
  ],

  async execute(client, interaction) {
    const allowedChannelId = "1170851587162382456";

    
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

    const user = interaction.options.getUser("user");
    const game = interaction.options.getString("game");
    const points = interaction.options.getInteger("points");

    await interaction.deferReply();

    if (!user || !points || !game) {
      return await interaction.editReply({
        content:
          "Por favor, especifica un usuario, la cantidad de puntos a agregar y el juego al que quieres agregar los puntos.",
      });
    }
    if (game === "AmongUs") {
      addPoints(client, user.id, points);
      return await interaction.editReply({
        content: `Se han agregado ${points} puntos a <@${user.id}> en el juego Among Us.`,
      });
    } else {
      addPointsCode(client, user.id, points);
      return await interaction.editReply({
        content: `Se han agregado ${points} puntos a <@${user.id}> en el juego ${game}.`,
      });
    }
  },
});
