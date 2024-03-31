
const path = require("node:path");
const Client = require("../core/classes/Client");
const Event = require("../core/classes/Event");
/**
 * Leyendo eventos
 * @param {Client} client El cliente
 * @param {string[]} dir El directorio
 */
function listenEvents(client, ...dir) {
  const directory = path.join(...dir);
  client.files.clear();
  client.removeAllListeners();
  client.setMaxListeners(1000);
  const files = client.files.loadFiles(directory);
  files.forEach((file) => {
    /**
     * @type {Event}
     */
    const event = require(file.path);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  });
}
module.exports = listenEvents;
