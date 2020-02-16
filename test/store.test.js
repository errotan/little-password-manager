//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert = require('assert').strict;
const fs = require('fs').promises;
const helper = require('./helper.js');
const lpmStore = require('../src/store.js');

const testPassword = '123password';

describe('lpm.store', () => {
  before(async () => helper.deleteStoreFile());
  after(async () => helper.deleteStoreFile());

  it('addPassword() should create store file', () => {
    lpmStore.open(testPassword, helper.tempStoreFile);
    lpmStore.addPassword('web', 'un', 'pw');
    assert(lpmStore.passwordFileExists());
  });

  it('getPasswords() should be array', () => {
    assert(typeof lpmStore.getPasswords() === 'object');
  });

  it('open() must throw error if password is incorrect', () => {
    assert.throws(
      () => {
        lpmStore.open('incorrect pass', helper.tempStoreFile);
      },
      /invalid/,
    );
  });

  it('open() must not throw error if password is correct', () => {
    assert.doesNotThrow(
      () => {
        lpmStore.open(testPassword, helper.tempStoreFile);
      },
    );
  });

  it('savePassword() should alter password', () => {
    lpmStore.savePassword(0, 'web2', 'un2', 'pw2');
    const passwords = lpmStore.getPasswords();
    assert.strictEqual(passwords[0].web, 'web2');
  });

  it('deletePassword() should delete password', () => {
    lpmStore.addPassword('web3', 'un3', 'pw3');
    lpmStore.deletePassword(1);
    const passwords = lpmStore.getPasswords();
    assert(typeof passwords[1] === 'undefined');
  });

  it('open() should throw error if store is corrupt', async () => {
    await fs.writeFile(helper.tempStoreFile, 'invalid content');

    assert.throws(
      () => {
        lpmStore.open(testPassword, helper.tempStoreFile);
      },
      /corrupted/,
    );
  });
});
