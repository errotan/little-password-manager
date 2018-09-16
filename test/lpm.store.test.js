//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert       = require('assert');
const fs           = require('fs');
const rewire       = require('rewire');
const lpmStore     = rewire('../lpm.store.js');
const newStorePath = 'passwords.test.json';
const testPassword = '123password';

function deleteStoreFile() {
  try {
    fs.unlinkSync(newStorePath);
  } catch (err) {
    // no handling
  }
}

describe('lpm.store', function() {

  it('setStoreFilePath() should save storefilepath', function() {

    assert.deepEqual(lpmStore.__get__('storeFilePath'), 'passwords.json');
    lpmStore.setStoreFilePath(newStorePath);
    assert.deepEqual(lpmStore.__get__('storeFilePath'), newStorePath);

  });

  it('setMainPassword() should save password', function() {

    assert.deepEqual(lpmStore.__get__('mainPassword'), '');
    lpmStore.setMainPassword(testPassword);
    assert.deepEqual(lpmStore.__get__('mainPassword'), testPassword);

  });

  deleteStoreFile();

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

});

deleteStoreFile();
