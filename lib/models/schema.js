// lib/models/schema.js

const mongoose = require("mongoose");

// Esquema para usuarios
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  league: { type: String, default: null },
  matches: [String],
  mvpPoints: { type: Number, default: 0 },
  radiantLevel: { type: String, default: null },
  puntos: { type: Number, default: 0 },
  partidasJugadas: { type: Number, default: 0 },
  partidasGanadas: {
    cantidadTripulante: { type: Number, default: 0 },
    cantidadImpostor: { type: Number, default: 0 },
  },
  partidasPerdidas: {
    cantidadTripulante: { type: Number, default: 0 },
    cantidadImpostor: { type: Number, default: 0 },
  },

  elogiosDados: {
    type: Map,
    of: [String],
  },
  elogiosRecibidos: {
    type: Map,
    of: {
      cantidad: { type: Number, default: 0 },
    },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  calibrationStatus: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWonAsCrewmate: { type: Number, default: 0 },
    gamesWonAsImpostor: { type: Number, default: 0 },
    mvpCount: { type: Number, default: 0 },
    isCalibrated: { type: Boolean, default: false },
  },
});

// Esquema para partidas
const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  gameType: { type: String, required: true },
  participants: [String],
  crewmates: [String],
  impostors: [String],
  numberOfImpostors: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  winMethod: String,
  winner: String,
  mvpId: String,
  duration: String,
  createdAt: { type: Number, default: Date.now },
  channelId: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const codenamesUserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  league: { type: String, default: null },
  matches: [String],
  mvpPoints: { type: Number, default: 0 },
  puntos: { type: Number, default: 0 },
  partidasJugadas: { type: Number, default: 0 },
  partidasGanadas: {
    cantidadOperativo: { type: Number, default: 0 },
    cantidadSpymaster: { type: Number, default: 0 },
  },
  blackCard: Number,
  partidasPerdidas: {
    cantidadOperativo: { type: Number, default: 0 },
    cantidadSpymaster: { type: Number, default: 0 },
  },
  elogiosDados: {
    type: Map,
    of: [String],
  },
  elogiosRecibidos: {
    type: Map,
    of: {
      cantidad: { type: Number, default: 0 },
    },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  calibrationStatus: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWonAsOperative: { type: Number, default: 0 },
    gamesWonAsSpy: { type: Number, default: 0 },
    mvpCount: { type: Number, default: 0 },
    isCalibrated: { type: Boolean, default: false },
  },
});

const codenamesMatchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  gameType: { type: String, required: true },
  participants: [String], // ID de los usuarios
  teams: {
    red: [String], // ID de los usuarios en el equipo rojo
    blue: [String], // ID de los usuarios en el equipo azul
  },
  score: {
    red: Number,
    blue: Number,
  },
  spyMasters: {
    red: String,
    blue: String,
  },
  operatives: {
    red: [String],
    blue: [String],
  },
  blackCard: [String], // Id de los usuarios que voltearon la carta negra
  winMethod: String, // 'Volteando todas las cartas' o 'Que el equipo contrario adivine la carta negra',
  winner: String, // 'red' o 'blue',
  mvpId: String,
  createdAt: { type: Number, default: Date.now },
  channelId: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const UserModel = mongoose.model("User", userSchema);
const MatchModel = mongoose.model("Match", matchSchema);
const CodenamesMatchModel = mongoose.model(
  "CodenamesMatch",
  codenamesMatchSchema
);
const CodenamesUserModel = mongoose.model("CodenamesUser", codenamesUserSchema);

module.exports = {
  UserModel,
  MatchModel,
  CodenamesMatchModel,
  CodenamesUserModel,
};
