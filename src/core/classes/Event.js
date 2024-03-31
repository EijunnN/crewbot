// src/core/classes/Event.js
/**
 * @template {keyof import("discord.js").ClientEvents} T
 */
class Event {
  /**
   * @param {import("../../../types").ClientEvent<T>} options
   */
  constructor(options) {
    this.name = options.name;
    this.once = options.once;
    this.execute = options.execute;
  }
}

module.exports = Event;
