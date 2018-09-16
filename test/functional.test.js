//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert       = require('assert');
const fs           = require('fs');
const lpmMain      = require('../lpm.main.js');
const lpmStore     = require('../lpm.store.js');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
const TestEmitter  = new Emitter();

require('jsdom-global')();

const jQuery            = require('jquery');
const $                 = jQuery(window);
global.$                = $;

// read template
document.body.innerHTML = fs.readFileSync('lpm.html', 'utf8').toString();

describe('Functional tests', function() {

  describe('init()', function() {

    lpmMain(TestEmitter, document);

    it('should show/hide password again field', function() {

      assert.equal(
        lpmStore.passwordFileExists(),
        document.getElementsByClassName('js-password-again').item(0).classList.contains('hidden')
      );

    });  
  });
});
