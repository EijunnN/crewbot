const { SnowflakeUtil } = require("discord.js");
const { CodenamesMatchModel } = require("../../../../lib/models/schema");

async function createMatchCodenames(
  client,
  channelId,
  participants,
) {
  try {
    let existingMatch = await CodenamesMatchModel.findOne({
      channelId: channelId,
      done: false,
    });

    if (existingMatch) {
      const uniqueParticipants = new Set([
        ...existingMatch.participants,
        ...participants,
      ]);
      existingMatch.participants = Array.from(uniqueParticipants);
      await existingMatch.save();
    } else {
      const matchId = SnowflakeUtil.generate().toString();
      const newMatch = new CodenamesMatchModel({
        matchId: matchId,
        gameType: "Codenames",
        channelId: channelId,
        participants: participants,
        teams: {
          red: [],
          blue: [],
        },
        score : {
          red: 0,
          blue: 0,
        },
        createdAt: Date.now(),
        done: false,
      });
      await newMatch.save();
      console.log("Partida de Codenames creada con éxito.");
    }
  } catch (error) {
    console.error("Error al crear la partida de Codenames:", error);
  }
}

module.exports = createMatchCodenames;
