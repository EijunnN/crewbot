
/**
 * Crea un botón
 * @param {import("../../types").Button} data El botón
 * @returns {import("../../types").Button}
 */
function Button(data) {
  return data;
}

/**
 * Crea un menú
 * @param {import("../../types").StringSelectMenu} data El menú
 * @returns {import("../../types").StringSelectMenu}
 */
function StringSelectMenu(data) {
  return data;
}

/**
 * Crea un formulario
 * @param {import("../../types").Modal} data El formulario
 * @returns {import("../../types").Modal}
 */
function Modal(data) {
  return data;
}
module.exports = { Button, StringSelectMenu, Modal };
