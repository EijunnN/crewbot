const { ChatCommand } = require("../../utils/commands");
const {
  MatchModel,
  CodenamesMatchModel,
} = require("../../../lib/models/schema");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = ChatCommand({
  name: "borrar",
  description: "Elimina una partida en curso y la borra de la base de datos",
  options: [
    {
      name: "matchid",
      type: ApplicationCommandOptionType.String,
      description: "ID de la partida que quieres eliminar",
      required: true,
    },
  ],
  async execute(client, interaction) {
    const ephemeral = !interaction.member.roles.cache.has(process.env.ROLE_ID);

    if (ephemeral) {
      return interaction.editReply({
        content: "No tienes permiso para usar este comando.",
      });
    }

    
    const matchId = interaction.options.getString("matchid");

    
    const match = (await MatchModel.findOneAndDelete({
      matchId: matchId,
      done: false,
    }))
      ? true
      : (await CodenamesMatchModel.findOneAndDelete({
          matchId: matchId,
          done: false,
        }))
      ? true
      : false;

    if (!match) {
      return interaction.reply({
        content:
          "No se encontró una partida en curso con esa ID o ya ha sido finalizada.",
        ephemeral: true,
      });
    }

    
    await interaction.reply(`La partida con ID ${matchId} ha sido eliminada.`);
  },
});
