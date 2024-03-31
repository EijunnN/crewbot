const { UserModel } = require("../../../lib/models/schema");

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
    crewmate: { win: 5, lose: -20 },
    impostor: { win: 15, lose: -15 },
  },
  Diamante: {
    crewmate: { win: 20, lose: -30 },
    impostor: { win: 40, lose: -30 },
  },
  Platino: {
    crewmate: { win: 25, lose: -15 },
    impostor: { win: 45, lose: -25 },
  },
  Oro: {
    crewmate: { win: 30, lose: -10 },
    impostor: { win: 50, lose: -20 },
  },
  Plata: {
    crewmate: { win: 35, lose: -7 },
    impostor: { win: 55, lose: -15 },
  },
  Bronce: {
    crewmate: { win: 45, lose: -5 },
    impostor: { win: 60, lose: -12 },
  },
};

async function createUserProfileIfNeeded(userId) {
  let userProfile = await UserModel.findOne({ id: userId });
  if (!userProfile) {
    userProfile = new UserModel({ id: userId });
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
  const { gamesWonAsCrewmate, gamesWonAsImpostor, mvpCount } =
    userProfile.calibrationStatus;
  let totalWins = gamesWonAsCrewmate + gamesWonAsImpostor;

  if (
    totalWins >= 20 ||
    (totalWins >= 17 && mvpCount >= 10) ||
    (totalWins >= 18 && mvpCount >= 7)
  ) {
    userProfile.league = "Radiante";
    userProfile.puntos = 3500;
  } else if (
    (totalWins >= 16 && mvpCount >= 5) ||
    (totalWins >= 15 && mvpCount >= 6)
  ) {
    userProfile.league = "Diamante";
    userProfile.puntos = 2000;
  } else if (
    (totalWins >= 15 && mvpCount >= 3) ||
    (totalWins >= 14 && mvpCount >= 5)
  ) {
    userProfile.league = "Platino";
    userProfile.puntos = 1300;
  } else if (totalWins >= 14 || (totalWins >= 10 && mvpCount >= 3)) {
    userProfile.league = "Oro";
    userProfile.puntos = 1000;
  } else if (totalWins >= 12 || (totalWins >= 8 && mvpCount >= 2)) {
    userProfile.league = "Plata";
    userProfile.puntos = 800;
  } else if (totalWins >= 8) {
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
      elogios["Buen Análisis"] >= 100 &&
      elogios["Buenas Kills"] >= 20 &&
      elogios["Actitud Positiva"] >= 30 &&
      elogios["Buen Descarte"] >= 40 &&
      elogios["Buena Defensa"] >= 20
    ) {
      userProfile.radiantLevel = "Supremo";
    } else if (
      elogios["Buen Análisis"] >= 50 &&
      elogios["Buenas Kills"] >= 20 &&
      elogios["Actitud Positiva"] >= 25 &&
      elogios["Buen Descarte"] >= 20
    ) {
      userProfile.radiantLevel = "Resplandeciente";
    } else if (
      elogios["Buen Análisis"] >= 35 &&
      elogios["Buenas Kills"] >= 15 &&
      elogios["Actitud Positiva"] >= 15
    ) {
      userProfile.radiantLevel = "Estelar";
    } else {
      userProfile.radiantLevel = null;
    }
  }
}

async function updateUserProfile(userId, isWinner, isMvp, role, matchId) {
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
    role === "crewmate"
      ? userProfile.partidasGanadas.cantidadTripulante++
      : userProfile.partidasGanadas.cantidadImpostor++;
  } else {
    role === "crewmate"
      ? userProfile.partidasPerdidas.cantidadTripulante++
      : userProfile.partidasPerdidas.cantidadImpostor++;
  }

  // Incrementar puntos MVP si es el caso
  if (isMvp) {
    userProfile.mvpPoints++;
  }

  // Actualizar puntos de liga y calibración
  if (!userProfile.calibrationStatus.isCalibrated) {
    userProfile.calibrationStatus.gamesPlayed++;
    if (isWinner) {
      role === "crewmate"
        ? userProfile.calibrationStatus.gamesWonAsCrewmate++
        : userProfile.calibrationStatus.gamesWonAsImpostor++;
    }
    // Incrementar mvpCount solo durante la fase de calibración
    if (isMvp) {
      userProfile.calibrationStatus.mvpCount++;
    }

    // Asignar liga basada en la calibración
    if (userProfile.calibrationStatus.gamesPlayed >= 20) {
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

module.exports = updateUserProfile;
