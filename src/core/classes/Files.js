// src/core/classes/Files.js
const { join } = require("path");
const { readdirSync, lstatSync } = require("fs");
class FileManager {
  constructor() {
    this.collection = [];
  }
  loadFiles(dir) {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const stat = lstatSync(join(dir, file));
      if (stat.isDirectory()) {
        this.loadFiles(join(dir, file));
      } else
        this.collection.push({
          name: file,
          path: join(dir, file),
        });
    });
    return this.collection;
  }
  getFiles(dir, options) {
    const fileArray = [];
    const files = readdirSync(dir, {
      withFileTypes: true,
    });
    files.forEach((file) => {
      const filePath = join(dir, file.name);
      if (options?.foldersOnly) {
        if (file.isDirectory()) {
          fileArray.push({ name: file.name, path: filePath });
        }
      } else {
        if (options?.loop) {
          this.getFiles(filePath);
        } else if (file.isFile()) {
          fileArray.push({
            name: file.name,
            path: filePath,
          });
        }
      }
    });
    return fileArray;
  }
  clear() {
    this.collection = [];
  }
}
module.exports = FileManager;
