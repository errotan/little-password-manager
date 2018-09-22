//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert        = require('assert');
const fs            = require('fs');
const helper        = require('./helper.js');
const lpmMain       = require('../lpm.main.js');
const lpmStore      = require('../lpm.store.js');
const EventEmitter  = require('events');
class Emitter extends EventEmitter {
  maximize() {
  }
}
const TestEmitter   = new Emitter();
const tempPassword  = 'secret54321';

// create browser env
require('jsdom-global')(
  fs.readFileSync('lpm.html', 'utf8').toString(),
  {
    beforeParse(window) {
      window.alert = function() {};
      window.confirm = function() { return true; };
    }
  }
);

// set temp path
lpmStore.setStoreFilePath(helper.tempStoreFile);

// call init
lpmMain(TestEmitter, document, helper.tempStoreFile);

describe('lpm.main', function() {

  after(function() {
    helper.deleteStoreFile();
  });

  it('password again shown if store file is not found', function() {

    assert.equal(
      lpmStore.passwordFileExists(),
      document.getElementsByClassName('js-password-again').item(0).classList.contains('hidden')
    );

  });

  it('login shows table', function() {

    document.getElementById('loginpassword').value = tempPassword;
    document.getElementById('loginpassword2').value = tempPassword;
    document.getElementById('loginsubmit').click();

    assert.equal(document.getElementsByClassName('table').item(0).classList.contains('hidden'), false);

  });

  it('adding entry creates store file', function() {

    let inputs = document.getElementsByClassName('form-control');
    
    inputs.item(3).value = 'un';
    inputs.item(4).value = 'web';
    inputs.item(5).value = 'pw';
    inputs.item(6).click();

    assert(lpmStore.passwordFileExists());

  });

  it('delete removes row from store file', function() {

    let inputs = document.getElementsByClassName('form-control');
    
    inputs.item(3).value = 'un2';
    inputs.item(4).value = 'web2';
    inputs.item(5).value = 'pw2';
    inputs.item(6).click();

    assert.equal(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 4);

    document.getElementsByClassName('ion-md-trash').item(0).click();

    assert.equal(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 3);

  });

  it('minimize clears table', function() {

    TestEmitter.on('minimize', function() {
      assert.equal(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 2);
    });

    TestEmitter.emit('minimize');

  });
});
