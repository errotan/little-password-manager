//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

'use strict';

// require NW.js
if (typeof nw === 'undefined') {
  throw new Error('This application needs to be run in NW.js!');
}

// run init after page loaded
document.addEventListener('DOMContentLoaded', function() {
  require('./lpm.main.js')(nw.Window.get(), document);
});
