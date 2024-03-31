const { Event } = require("../../core");

module.exports = new Event({
  name: "interactionCreate",
  async execute(client, interaction) {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    const command = client.commands.get(commandName);
    if (command ) {
      if (command.roles && !command.roles.some(role => interaction.member.roles.cache.has(role))) {
        return await interaction.reply({
          content: "No tienes permiso para usar este comando.",
          ephemeral: true,
        });
      }
      if (command.permissions && !command.permissions.some(permission => interaction.member.permissions.has(permission))) {
        return await interaction.reply({
          content: "No tienes permiso para usar este comando.",
          ephemeral: true,
        });
      }
      await command.execute(client, interaction);
    }
  },
});



