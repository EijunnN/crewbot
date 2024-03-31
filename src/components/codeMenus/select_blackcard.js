const { StringSelectMenuBuilder, ActionRowBuilder, ModalBuilder } = require("discord.js");
const { StringSelectMenu } = require("../../utils/components");
const { RestartButton } = require("../../utils/constants");
const { CodenamesMatchModel, CodenamesUserModel  } = require("../../../lib/models/schema");



module.exports = StringSelectMenu({
    customId: "select_blackcard",

    async execute(client, interaction, reply) {
        const selectedBlackCard = interaction.values[0];
        const channelId = interaction.member.voice.channelId;

        try {
            let storedMatch = await CodenamesMatchModel.findOne({
                channelId: channelId,
                done: false,
            });
            
            if (!storedMatch) {
                reply.edit({ components: [] });
                return await interaction.followUp({
                    content: "No encontré la partida :c",
                    ephemeral: true,
                });
            }

            storedMatch.blackCard = selectedBlackCard;
            await storedMatch.save();

            let teamWinOptions = storedMatch.teams[storedMatch.winner].map(userId => {
                const member = interaction.guild.members.cache.get(userId);
                return member ? {
                    label: member.displayName,
                    value: userId,
                    description: member.user.username
                } : null;
            }).filter(option => option !== null);

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId("player_mvp")
                .setPlaceholder("¿Quién fue el MVP?")
                .addOptions(teamWinOptions)
                .setMaxValues(1)
            );

            reply.edit({
                content: "Selecciona el MVP de la partida:",
                components: [row, new ActionRowBuilder().addComponents(RestartButton)],
            });
                
        }
        catch (error) {
            confirm.error("Error al seleccionar carta negra:", error);
            await interaction.editReply({
                content: "Hubo un error al procesar tu solicitud.",
                components: [],
            });
        }
    }
});