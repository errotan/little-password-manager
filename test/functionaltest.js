//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert       = require('assert');
const fs           = require('fs');
const lpm          = require('../lpm.js');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
const TestEmitter  = new Emitter();

require('jsdom-global')();

const jQuery            = require('jquery');
const $                 = jQuery(window);
global.$                = $;

// read template
document.body.innerHTML = fs.readFileSync('lpm.html', 'utf8').toString();

// dependencies
lpm.setWin(TestEmitter);
lpm.setDocument(document);

describe('Functional tests', function() {

  describe('init()', function() {

    lpm.init();

    it('should show/hide password again field', function() {

      assert.equal(
        fs.existsSync('passwords.json'),
        document.getElementsByClassName('js-password-again').item(0).classList.contains('hidden')
      );

    });  
  });
});
