//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert = require('assert').strict;
const fs = require('fs').promises;
const jsdomGlobal = require('jsdom-global');
const EventEmitter = require('events');
const helper = require('./helper.js');
const lpmMain = require('../src/main.js');

class WindowEmitter extends EventEmitter {
  maximize() {
  }
}

const windowEmitter = new WindowEmitter();
const clipboardEmitter = new EventEmitter();
const tempPassword = 'secret54321';

describe('lpm.main', () => {
  before(async () => {
    await helper.deleteStoreFile();

    // create browser env
    jsdomGlobal(await fs.readFile('src/index.html', 'utf8'));

    // call init
    lpmMain(windowEmitter, clipboardEmitter, document, helper.tempStoreFile);
  });

  after(async () => helper.deleteStoreFile());

  it('password again shown on first start', () => {
    assert.strictEqual(
      document.getElementsByClassName('js-password-again').item(0).classList.contains('hidden'),
      false,
    );
  });

  it('after login passwords are listed', () => {
    document.getElementById('loginpassword').value = tempPassword;
    document.getElementById('loginpassword2').value = tempPassword;
    document.getElementById('loginsubmit').click();

    assert.strictEqual(
      document.getElementsByClassName('table').item(0).classList.contains('hidden'),
      false,
    );
  });

  it('adding entry creates row', () => {
    const inputs = document.getElementsByClassName('form-control');

    inputs.item(3).value = 'un';
    inputs.item(4).value = 'web';
    inputs.item(5).value = 'pw';
    inputs.item(6).click();

    assert.strictEqual(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 3);
  });

  it('delete removes row', () => {
    const inputs = document.getElementsByClassName('form-control');

    inputs.item(3).value = 'un2';
    inputs.item(5).value = 'pw2';
    inputs.item(6).click();

    assert.strictEqual(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 4);

    const firstTrashIcon = document.getElementsByClassName('ion-md-trash').item(0);
    firstTrashIcon.dataset.confirmed = true;
    firstTrashIcon.click();

    assert.strictEqual(document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length, 3);
  });

  it('clicking edit creates input fields', () => {
    assert.strictEqual(document.getElementsByClassName('form-control').length, 7);

    document.getElementsByClassName('ion-md-create').item(0).click();

    assert.strictEqual(document.getElementsByClassName('form-control').length, 10);
  });

  it('clicking cancel removes input fields', () => {
    assert.strictEqual(document.getElementsByClassName('form-control').length, 10);

    document.getElementsByClassName('ion-md-close').item(0).click();

    assert.strictEqual(document.getElementsByClassName('form-control').length, 7);
  });

  it('minimize clears table', () => {
    windowEmitter.on('minimize', () => {
      assert.strictEqual(
        document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length,
        2,
      );
    });

    windowEmitter.emit('minimize');
  });
});
