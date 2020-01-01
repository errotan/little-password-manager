//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert = require('assert');
const fs = require('fs');
const EventEmitter = require('events');
const helper = require('./helper.js');
const lpmMain = require('../lpm.main.js');
const lpmStore = require('../lpm.store.js');

class Emitter extends EventEmitter {
  maximize() {
  }
}

const TestEmitter = new Emitter();
const tempPassword = 'secret54321';

// create browser env
require('jsdom-global')(
  fs.readFileSync('lpm.html', 'utf8').toString(),
  {
    beforeParse(window) {
      window.alert = function () {
      };
      window.confirm = function () {
        return true;
      };
    },
  },
);

// set temp path
lpmStore.setStoreFilePath(helper.tempStoreFile);

// call init
lpmMain(TestEmitter, document, helper.tempStoreFile);

describe('lpm.main', () => {
  after(() => {
    helper.deleteStoreFile();
  });

  it('password again shown if store file is not found', () => {
    assert.equal(
      lpmStore.passwordFileExists(),
      document.getElementsByClassName('js-password-again').item(0).classList.contains('hidden'),
    );
  });

  it('after login passwords are listed', () => {
    document.getElementById('loginpassword').value = tempPassword;
    document.getElementById('loginpassword2').value = tempPassword;
    document.getElementById('loginsubmit').click();

    assert.equal(document.getElementsByClassName('table').item(0).classList.contains('hidden'), false);
  });

  it('adding entry creates store file', () => {
    const inputs = document.getElementsByClassName('form-control');

    inputs.item(3).value = 'un';
    inputs.item(4).value = 'web';
    inputs.item(5).value = 'pw';
    inputs.item(6).click();

    assert(lpmStore.passwordFileExists());
  });

  it('delete removes row from store file', () => {
    const inputs = document.getElementsByClassName('form-control');

    inputs.item(3).value = 'un2';
    inputs.item(5).value = 'pw2';
    inputs.item(6).click();

    assert.equal(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 4);

    document.getElementsByClassName('ion-md-trash').item(0).click();

    assert.equal(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 3);
  });

  it('clicking edit creates input fields', () => {
    assert.equal(document.getElementsByClassName('form-control').length, 7);

    document.getElementsByClassName('ion-md-create').item(0).click();

    assert.equal(document.getElementsByClassName('form-control').length, 10);
  });

  it('clicking cancel removes input fields', () => {
    assert.equal(document.getElementsByClassName('form-control').length, 10);

    document.getElementsByClassName('ion-md-close').item(0).click();

    assert.equal(document.getElementsByClassName('form-control').length, 7);
  });

  it('minimize clears table', () => {
    TestEmitter.on('minimize', () => {
      assert.equal(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 2);
    });

    TestEmitter.emit('minimize');
  });
});
