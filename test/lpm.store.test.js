//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert       = require('assert');
const fs           = require('fs');
const rewire       = require('rewire');
const helper       = require('./helper.js');
const lpmStore     = rewire('../lpm.store.js');
const testPassword = '123password';

describe('lpm.store', function() {

  after(function() {
    helper.deleteStoreFile();
  });

  it('setStoreFilePath() should save storefilepath', function() {

    assert.deepEqual(lpmStore.__get__('storeFilePath'), 'passwords.json');
    lpmStore.setStoreFilePath(helper.tempStoreFile);
    assert.deepEqual(lpmStore.__get__('storeFilePath'), helper.tempStoreFile);

  });

  it('setMainPassword() should save password', function() {

    assert.deepEqual(lpmStore.__get__('mainPassword'), '');
    lpmStore.setMainPassword(testPassword);
    assert.deepEqual(lpmStore.__get__('mainPassword'), testPassword);

  });

  it('addPassword() should create store file', function() {

    lpmStore.addPassword('web', 'un', 'pw');
    assert.deepEqual(lpmStore.passwordFileExists(), true);

  });

  it('getPasswords() should be array', function() {

    assert(typeof lpmStore.getPasswords() === 'object');

  });

  it('passwordValid() should return false if password is incorrect', function() {

    lpmStore.setMainPassword('incorrect pass');
    assert.deepEqual(lpmStore.passwordValid(), false);

  });

  it('passwordValid() should return true if password is correct', function() {

    lpmStore.setMainPassword(testPassword);
    assert.deepEqual(lpmStore.passwordValid(), true);

  });

  it('savePassword() should alter password', function() {

    lpmStore.savePassword(0, 'web2', 'un2', 'pw2');
    let passwords = lpmStore.getPasswords();
    assert.deepEqual(passwords[0].web, 'web2');

  });

  it('deletePassword() should delete password', function() {

    lpmStore.addPassword('web3', 'un3', 'pw3');
    lpmStore.deletePassword(1);
    let passwords = lpmStore.getPasswords();
    assert(typeof passwords[1] === 'undefined');

  });

  it('readPasswordFile() should throw error if store is corrupt', function() {

    fs.writeFileSync(helper.tempStoreFile, 'invalid content', 'utf8');

    assert.throws(
      function() { lpmStore.passwordValid(); },
      /corrupted/
    );

    helper.deleteStoreFile();

  });
});
