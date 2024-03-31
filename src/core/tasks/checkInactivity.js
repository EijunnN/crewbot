const cron = require('node-cron');
const { UserModel } = require('../../../lib/models/schema');


cron.schedule('0 0 * * *', async () => {
  console.log('Tarea cron ejecutándose cada día a medianoche');
  const INACTIVITY_THRESHOLD_DAYS = 5; 
  const users = await UserModel.find({});

  for (const user of users) {
    
    if (user.lastActive && (new Date() - new Date(user.lastActive) >= INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000)) {
      user.league = null;
      user.puntos = 0;
      user.calibrationStatus.isCalibrated = false;
      user.calibrationStatus.gamesPlayed = 0;
      user.calibrationStatus.gamesWonAsCrewmate = 0;
      user.calibrationStatus.gamesWonAsImpostor = 0;
      user.calibrationStatus.mvpCount = 0;
      await user.save();
    }
  }
});
