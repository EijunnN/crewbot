const { SnowflakeUtil } = require("discord.js");
const { MatchModel } = require("../../../lib/models/schema");

async function createMatch(client, channelId, numberOfImpostors, participants) {
  try {
    let existingMatch = await MatchModel.findOne({ channelId: channelId, done: false });

    if (existingMatch) {
      
      const uniqueParticipants = new Set([...existingMatch.participants, ...participants]);
      existingMatch.participants = Array.from(uniqueParticipants);
      await existingMatch.save();
    } else {
      const matchId = SnowflakeUtil.generate().toString();
      const newMatch = new MatchModel({
        matchId: matchId,
        gameType: "AmongUs",
        channelId: channelId,
        participants: participants,
        crewmates: [],
        impostors: [],
        numberOfImpostors: numberOfImpostors || 2, 
        createdAt: Date.now(),
        done: false,
      });
      await newMatch.save();
    }
  } catch (error) {
    console.error("Error al crear o actualizar la partida:", error);
  }
}

module.exports = createMatch;
