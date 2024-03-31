

const path = require("node:path");
const Client = require("../core/classes/Client");
const { REST, Routes } = require("discord.js");
/**
 * Leyendo y guardando comandos
 * @param {Client} client El cliente
 * @param {string[]} dir El directorio
 */
function readCommands(client, ...dir) {
  const directory = path.join(...dir);
  client.files.clear();
  const files = client.files.loadFiles(directory);
  files.forEach((file) => {
    /**
     * @type {import("../../types").ChatInputCommand}
     */
    const command = require(file.path);
    client.commands.set(command.name, command);
  });
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  (async () => {
    try {
      console.log("🔁 Actualizando los comandos.");
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.TEST_GUILD_ID
        ),
        {
          body: client.commands.toJSON(),
        }
      );
      console.log("✅ Los comandos se han actualizado con éxito.");
    } catch (error) {
      console.log("💥 Ha ocurrido un error: ", error);
    }
  })();
  console.log(`💾 Se han guardado ${client.commands.size} comandos`);
}
module.exports = readCommands;
