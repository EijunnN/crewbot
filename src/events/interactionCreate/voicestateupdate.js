
const { Event } = require("../../core");

const ROLE_ID = "1178766244091011133";
// const ROLE_ID = "1119771454188306472"; // ID de rol del Server Crown

module.exports = new Event({
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    // Comprobar si el usuario ha salido del canal de voz
    if (oldState.channelId && !newState.channelId) {
      // El usuario ha salido de un canal de voz
      const memberId = oldState.member.id;
      const member = await newState.guild.members.fetch(memberId);
      member.roles.remove(ROLE_ID).catch(console.error); // Quitar rol
    }
  },
});
