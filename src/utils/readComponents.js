
const path = require("node:path");
const Client = require("../core/classes/Client");
const Event = require("../core/classes/Event");
const { REST, Routes } = require("discord.js");
/**
 * Leyendo y guardando componentes
 * @param {Client} client El cliente
 * @param {string[]} dir El directorio
 */
function readComponents(client, ...dir) {
  const directory = path.join(...dir);
  client.files.clear();
  const files = client.files.loadFiles(directory);
  files.forEach((file) => {

    /**
     * @type {import("../../types").Button | import("../../types").StringSelectMenu | import("../../types").Modal}
     */
    const component = require(file.path);
    console.log(`📁 Cargando componente ${component.customId}...`);
    client.components.set(component.customId, component);
  });
  console.log(`💾 Se han guardado ${client.components.size} componentes`)
}
module.exports = readComponents;
