// src/core/classes/Client.js
const Discord = require("discord.js");
const FileManager = require("./Files");
class Client extends Discord.Client {
  /**
   * @param {import("discord.js").ClientOptions} options
   */
  constructor(options) {
    super(options);
    /**
     * Colección de los perfiles
     * @type {Discord.Collection<string, import("../../../types").UserProfile>}
     */
    // this.profiles = new Discord.Collection();
    /**
     * Colección de las partidas
     * @type {Discord.Collection<string, import("../../../types").Match>}
     */
    this.matches = new Discord.Collection();

    /**
     * El administrador de archivos
     * @type {FileManager}
     */
    this.files = new FileManager();

    /**
     * Colección de comandos
     * @type {Discord.Collection<string, import("../../../types").ChatInputCommand>}
     */
    this.commands = new Discord.Collection();

    /**
     * Colección de componentes
     * @type {Discord.Collection<string, import("../../../types").Button | import("../../../types").StringSelectMenu | import("../../../types").Modal>}
     */
    this.components = new Discord.Collection();

    /**
     * Colección para las interacciones
     * @type {Discord.Collection<string, import("discord.js").Snowflake>}
     */
    this.storage = new Discord.Collection();
  }
}
module.exports = Client;
