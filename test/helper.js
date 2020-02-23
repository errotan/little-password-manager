//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const fs = require('fs').promises;

const tempStoreFile = 'passwords.test.json';

async function deleteStoreFile() {
  try {
    await fs.unlink(tempStoreFile);
  } catch (err) {
    // no handling
  }
}

function mutationObserve(targetNode, callback) {
  const observer = new window.MutationObserver(() => {
    callback();
    observer.disconnect();
  });

  observer.observe(targetNode, { childList: true, subtree: true });
}

module.exports = {
  tempStoreFile,
  deleteStoreFile,
  mutationObserve,
};
