const { Event } = require("../core");

module.exports = new Event({
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.username} está listo!`);
  },
});
