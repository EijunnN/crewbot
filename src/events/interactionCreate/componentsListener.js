const { Event } = require("../../core");

module.exports = new Event({
  name: "interactionCreate",
  async execute(client, interaction) {
    const isComponent =
      interaction.isButton() ||
      interaction.isStringSelectMenu() 
      // || interaction.isModalSubmit();
    if (isComponent) {
      const reply = await interaction.deferUpdate({ fetchReply: true });
      const { customId } = interaction;
      console.log("Custom ID:", customId);
      const component = client.components.get(customId);
      
      if (!component)
        return await interaction.followUp({
          content: `Ese ${
            interaction.isButton()
              ? "botón"
              : interaction.isStringSelectMenu()
              ? "menú"
              : "formulario"
          } aún no hace nada.`,
          ephemeral: true,
        });
      return await component.execute(client, interaction, reply);
    }
  },
});
