

const path = require("node:path");
const Client = require("../core/classes/Client");
const handlersPath = path.join(process.cwd(), "src", "handlers");
/**
 * Leyendo eventos
 * @param {Client} client El cliente
 * @param {string[]} dir El directorio
 */
function listenHandlers(client, ...dir) {
  const directory = path.join(...dir);
  client.files.clear();
  const handlerFiles = client.files.loadFiles(directory);
  handlerFiles.forEach(({ path, name }) => {
    try {
      console.log(`🤝 Leyendo el handler (${name.replace(".js", "")})`);
      require(path)(client);
    } catch (error) {
      console.log(error);
    }
  });
}
module.exports = listenHandlers;
