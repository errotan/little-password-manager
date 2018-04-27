//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

'use strict';

// require NW.js
if (typeof nw === 'undefined') {
  throw new Error('This application needs to be run in NW.js!');
}

let lpm = require('./lpm.js');

// pass environment
lpm.setWin(nw.Window.get());
lpm.setDocument(document);

// run init after page loaded
document.addEventListener('DOMContentLoaded', function() { lpm.init(); });
