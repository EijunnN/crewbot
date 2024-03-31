const { UserModel } = require('../../../lib/models/schema');

async function addPoints(client, userId, points) {
  try {
    const user = await UserModel.findOne({ id: userId });
    if (!user) {
      
      const newUser = new UserModel({
        id: userId,
        puntos: Math.max(points, 0) 
      });
      await newUser.save();
    } else {
      
      if (points < 0 && Math.abs(points) > user.puntos) {
        user.puntos = 0; 
      } else {
        user.puntos = user.puntos + points;
      }
      await user.save();
    }
  } catch (error) {
    console.error("Error al actualizar los puntos del usuario:", error);
  }
}

module.exports = addPoints;