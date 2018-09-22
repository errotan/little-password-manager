//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const fs            = require('fs');
const tempStoreFile = 'passwords.test.json';

function deleteStoreFile() {
  try {
    fs.unlinkSync(tempStoreFile);
  } catch (err) {
    // no handling
  }
}

module.exports = {
  tempStoreFile: tempStoreFile,
  deleteStoreFile: deleteStoreFile
};
