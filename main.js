//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

'use strict';

// require NW.js
if (typeof nw === 'undefined') {
  throw new Error('This application needs to be run in NW.js!');
}

var lpm = require('./lpm.js');

// pass environment
lpm.setNw(nw.Window.get());
lpm.setDocument(document);

document.addEventListener('DOMContentLoaded', function() { lpm.init(); });
