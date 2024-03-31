
const { UserModel } = require('../../../lib/models/schema');

async function addMvpPoints(client, userId, points) {
  try {
    const user = await UserModel.findOne({ id: userId });
    if (!user) {
      // Si el usuario no existe, crea uno nuevo
      const newUser = new UserModel({
        id: userId,
        mvpPoints: Math.max(points, 0) 
      });
      await newUser.save();
    } else {
      
      user.mvpPoints = Math.max(user.mvpPoints + points, 0); 
      await user.save();
    }
  } catch (error) {
    console.error("Error al actualizar los puntos MVP del usuario:", error);
  }
}

module.exports = addMvpPoints;
