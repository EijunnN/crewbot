const { UserModel } = require("../../../lib/models/schema");
const { UserInfoModel } = require("../../../lib/models/userInfoSchema");

async function updateUserInfo(member) {
  try {
    // Primero, verifica si el usuario está en el esquema User
    const userExists = await UserModel.exists({ id: member.id });
    if (!userExists) return; // Si no existe, no hacemos nada

    // Busca el documento UserInfo existente o crea uno nuevo
    let userInfo = await UserInfoModel.findOne({ userId: member.id });
    if (!userInfo) {
      userInfo = new UserInfoModel({ userId: member.id });
    }

    // Actualiza la información
    userInfo.username = member.user.username;
    userInfo.discriminator = member.user.discriminator;
    userInfo.avatar = member.user.avatar;
    userInfo.nickname = member.nickname;
    userInfo.roles = member.roles.cache.map(role => role.id);
    userInfo.joinedAt = member.joinedAt;
    userInfo.premiumSince = member.premiumSince;
    userInfo.lastUpdated = new Date();

    // Guarda los cambios
    await userInfo.save();
    console.log(`Updated UserInfo for ${member.user.tag}`);
  } catch (error) {
    console.error(`Error updating UserInfo for ${member.user.tag}:`, error);
  }
}

// Esta función se puede llamar cuando el bot se inicia para actualizar todos los usuarios
async function updateAllUsersInfo(guild) {
  const members = await guild.members.fetch();
  for (const [memberId, member] of members) {
    await updateUserInfo(member);
  }
}

module.exports = { updateUserInfo, updateAllUsersInfo };