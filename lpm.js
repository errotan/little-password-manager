//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

// require NW.js
if (typeof nw === 'undefined') {
  throw new Error('This application needs to be run in NW.js!');
}

const lpmMain = require('./lpm.main.js');

// run init after page loaded
document.addEventListener('DOMContentLoaded', () => {
  lpmMain(nw.Window.get(), nw.Clipboard.get(), document);
});
