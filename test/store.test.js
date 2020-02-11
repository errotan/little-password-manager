//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert = require('assert');
const fs = require('fs');
const rewire = require('rewire');
const helper = require('./helper.js');

const lpmStore = rewire('../src/store.js');
const testPassword = '123password';

after(async () => helper.deleteStoreFile());

describe('lpm.store', () => {
  it('setStoreFilePath() should save storefilepath', () => {
    assert.deepEqual(lpmStore.__get__('storeFilePath'), 'passwords.json');
    lpmStore.setStoreFilePath(helper.tempStoreFile);
    assert.deepEqual(lpmStore.__get__('storeFilePath'), helper.tempStoreFile);
  });

  it('setMainPassword() should save password', () => {
    assert.deepEqual(lpmStore.__get__('mainPassword'), '');
    lpmStore.setMainPassword(testPassword);
    assert.deepEqual(lpmStore.__get__('mainPassword'), testPassword);
  });

  it('addPassword() should create store file', () => {
    lpmStore.addPassword('web', 'un', 'pw');
    assert.deepEqual(lpmStore.passwordFileExists(), true);
  });

  it('getPasswords() should be array', () => {
    assert(typeof lpmStore.getPasswords() === 'object');
  });

  it('passwordValid() should return false if password is incorrect', () => {
    lpmStore.setMainPassword('incorrect pass');
    assert.deepEqual(lpmStore.passwordValid(), false);
  });

  it('passwordValid() should return true if password is correct', () => {
    lpmStore.setMainPassword(testPassword);
    assert.deepEqual(lpmStore.passwordValid(), true);
  });

  it('savePassword() should alter password', () => {
    lpmStore.savePassword(0, 'web2', 'un2', 'pw2');
    const passwords = lpmStore.getPasswords();
    assert.deepEqual(passwords[0].web, 'web2');
  });

  it('deletePassword() should delete password', () => {
    lpmStore.addPassword('web3', 'un3', 'pw3');
    lpmStore.deletePassword(1);
    const passwords = lpmStore.getPasswords();
    assert(typeof passwords[1] === 'undefined');
  });

  it('readPasswordFile() should throw error if store is corrupt', () => {
    fs.writeFileSync(helper.tempStoreFile, 'invalid content', 'utf8');

    assert.throws(
      () => {
        lpmStore.passwordValid();
      },
      /corrupted/,
    );
  });
});
