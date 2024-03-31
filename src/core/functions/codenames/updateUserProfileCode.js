// src/core/functions/codenames/updateUserProfileCode.js

const { CodenamesUserModel } = require("../../../../lib/models/schema");

const leagueThresholds = {
  Radiante: { ascend: Infinity, descend: 3500 },
  Diamante: { ascend: 3500, descend: 2000 },
  Platino: { ascend: 2000, descend: 1300 },
  Oro: { ascend: 1300, descend: 1000 },
  Plata: { ascend: 1000, descend: 800 },
  Bronce: { ascend: 800, descend: 0 },
};

const leaguePoints = {
  Radiante: {
    operative: { win: 5, lose: -20 },
    spymaster: { win: 15, lose: -15 },
  },
  Diamante: {
    operative: { win: 20, lose: -30 },
    spymaster: { win: 40, lose: -30 },
  },
  Platino: {
    operative: { win: 25, lose: -15 },
    spymaster: { win: 45, lose: -25 },
  },
  Oro: {
    operative: { win: 30, lose: -10 },
    spymaster: { win: 50, lose: -20 },
  },
  Plata: {
    operative: { win: 35, lose: -7 },
    spymaster: { win: 55, lose: -15 },
  },
  Bronce: {
    operative: { win: 45, lose: -5 },
    spymaster: { win: 60, lose: -12 },
  },
};

async function createUserProfileIfNeeded(userId) {
  let userProfile = await CodenamesUserModel.findOne({ id: userId });
  if (!userProfile) {
    userProfile = new CodenamesUserModel({ id: userId });
    await userProfile.save();
  }
  return userProfile;
}

function getLeaguePointsChange(league, isWinner, role) {
  if (!league || !leaguePoints[league] || !leaguePoints[league][role]) {
    console.error(
      `Liga o rol no definidos o no encontrados: Liga - ${league}, Rol - ${role}`
    );
    return 0;
  }
  return isWinner
    ? leaguePoints[league][role].win
    : leaguePoints[league][role].lose;
}

function assignLeagueBasedOnCalibration(userProfile) {
  const { gamesWonAsOperative, gamesWonAsSpy, mvpCount } =
    userProfile.calibrationStatus;
  let totalWins = gamesWonAsOperative + gamesWonAsSpy;

  if (
    totalWins >= 15 ||
    (totalWins >= 14 && mvpCount >= 9) ||
    (totalWins >= 13 && mvpCount >= 8)
  ) {
    userProfile.league = "Radiante";
    userProfile.puntos = 3500;
  } else if (
    (totalWins >= 12 && mvpCount >= 7) ||
    (totalWins >= 13 && mvpCount >= 6)
  ) {
    userProfile.league = "Diamante";
    userProfile.puntos = 2000;
  } else if (
    (totalWins >= 11 && mvpCount >= 5) ||
    (totalWins >= 12 && mvpCount >= 4)
  ) {
    userProfile.league = "Platino";
    userProfile.puntos = 1300;
  } else if (totalWins >= 10 || (totalWins >= 9 && mvpCount >= 4)) {
    userProfile.league = "Oro";
    userProfile.puntos = 1000;
  } else if (totalWins >= 9 || (totalWins >= 8 && mvpCount >= 3)) {
    userProfile.league = "Plata";
    userProfile.puntos = 800;
  } else if (totalWins >= 7) {
    userProfile.league = "Bronce";
    userProfile.puntos = 500;
  } else {
    userProfile.league = "Bronce";
    userProfile.puntos = 500;
  }

  userProfile.calibrationStatus.isCalibrated = true;
}

function updateLeaguePoints(userProfile, isWinner, role) {
  const league = userProfile.league;
  if (league) {
    const pointsChange = getLeaguePointsChange(league, isWinner, role);
    userProfile.puntos += pointsChange;
  }
}

function checkAndAdjustLeague(userProfile) {
  const leagues = Object.keys(leagueThresholds);
  const currentLeagueIndex = leagues.indexOf(userProfile.league);
  const currentThresholds = leagueThresholds[userProfile.league];

  console.log(leagues);
  console.log(currentLeagueIndex);
  console.log(currentThresholds);
  // Verificar si el usuario debe ascender
  if (
    userProfile.puntos >= currentThresholds.ascend &&
    currentLeagueIndex > 0
  ) {
    userProfile.league = leagues[currentLeagueIndex - 1];
  }
  // Verificar si el usuario debe descender
  else if (
    userProfile.puntos < currentThresholds.descend &&
    currentLeagueIndex < leagues.length - 1
  ) {
    console.log(
      `curentLeagueIndex: ${currentLeagueIndex}, leagues: ${leagues}`
    );
    userProfile.league = leagues[currentLeagueIndex + 1];
  } else {
    console.log(
      `[CheckAndAdjustLeague] No se requiere ajuste de liga para el usuario ${userProfile.id} `
    );
  }
}

function assignRadiantLevel(userProfile) {
  const elogios = userProfile.elogiosRecibidos;

  if (userProfile.league === "Radiante") {
    if (
      elogios["Buen Acierto"] >= 100 &&
      elogios["Juego en Equipo"] >= 20 &&
      elogios["Actitud Positiva"] >= 30 &&
      elogios["Buenas Pistas"] >= 40
      //  && elogios["Buena Defensa"] >= 20
    ) {
      userProfile.radiantLevel = "Supremo";
    } else if (
      elogios["Buen Acierto"] >= 50 &&
      elogios["Juego en Equipo"] >= 20 &&
      elogios["Actitud Positiva"] >= 25 &&
      elogios["Buenas Pistas"] >= 20
    ) {
      userProfile.radiantLevel = "Resplandeciente";
    } else if (
      elogios["Buenas Pistas"] >= 35 &&
      elogios["Juego en Equipo"] >= 15 &&
      elogios["Actitud Positiva"] >= 15
    ) {
      userProfile.radiantLevel = "Estelar";
    } else {
      userProfile.radiantLevel = null;
    }
  }
}

async function updateUserProfileCode(userId, isWinner, isMvp, role, matchId) {
  let userProfile = await createUserProfileIfNeeded(userId);

  // Agregar el ID de la partida si es nuevo
  if (
    matchId &&
    typeof matchId === "string" &&
    !userProfile.matches.includes(matchId)
  ) {
    userProfile.matches.push(matchId);
  }

  // Incrementar contadores de partidas jugadas y ganadas/perdidas
  userProfile.partidasJugadas++;
  if (isWinner) {
    role === "blue"
      ? userProfile.partidasGanadas.cantidadOperativo++
      : userProfile.partidasGanadas.cantidadSpymaster++;
  } else {
    role === "red"
      ? userProfile.partidasPerdidas.cantidadOperativo++
      : userProfile.partidasPerdidas.cantidadSpymaster++;
  }

  // Incrementar puntos MVP si es el caso
  if (isMvp) {
    userProfile.mvpPoints++;
  }

  // Actualizar puntos de liga y calibración
  if (!userProfile.calibrationStatus.isCalibrated) {
    userProfile.calibrationStatus.gamesPlayed++;
    if (isWinner) {
      role === "blue"
        ? userProfile.calibrationStatus.gamesWonAsOperative++
        : userProfile.calibrationStatus.gamesWonAsSpy++;
    }
    // Incrementar mvpCount solo durante la fase de calibración
    if (isMvp) {
      userProfile.calibrationStatus.mvpCount++;
    }

    // Asignar liga basada en la calibración
    if (userProfile.calibrationStatus.gamesPlayed >= 15) {
      assignLeagueBasedOnCalibration(userProfile);
      userProfile.calibrationStatus.isCalibrated = true;
    }
  } else {
    // Actualizar puntos y liga para usuarios ya calibrados
    updateLeaguePoints(userProfile, isWinner, role);
    console.log(
      `[Update League Points] Usuario: ${userId}, Puntos Actualizados: ${userProfile.puntos}, Liga: ${userProfile.league}`
    );
    console.log(
      `[Antes de CheckAndAdjust] Usuario: ${userId}, Puntos: ${userProfile.puntos}, Liga Actual: ${userProfile.league}`
    );
    checkAndAdjustLeague(userProfile);
    console.log(
      `[Despues de CheckAndAdjust] Usuario: ${userId}, Puntos: ${userProfile.puntos}, Liga Actual: ${userProfile.league}`
    );
  }

  // Asignar nivel Radiante si es aplicable
  assignRadiantLevel(userProfile);

  userProfile.lastActive = new Date();
  // Guardar los cambios en el perfil del usuario
  await userProfile.save();
  console.log(
    `[Perfil Actualizado] Usuario: ${userId}, Liga: ${
      userProfile.league
    }, Puntos: ${userProfile.puntos}, Nivel Radiante: ${
      userProfile.radiantLevel || "No Aplica"
    }`
  );
  return userProfile;
}

module.exports = updateUserProfileCode;
