//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert = require('assert').strict;
const fs = require('fs').promises;
const helper = require('./helper.js');
const lpmStore = require('../src/store.js');

const testPassword = '123password';

describe('lpm.store', () => {
  before(async () => {
    await helper.deleteStoreFile();
    lpmStore.setFilePath(helper.tempStoreFile);
    await lpmStore.open(testPassword);
  });
  after(async () => helper.deleteStoreFile());

  it('addPassword() should create store file', async () => {
    await lpmStore.addPassword('web', 'un', 'pw');
    assert(await lpmStore.passwordFileExists());
  });

  it('getPasswords() should be array', () => {
    assert(typeof lpmStore.getPasswords() === 'object');
  });

  it('open() must throw error if password is incorrect', async () => {
    try {
      await lpmStore.open('incorrect pass');
      assert.fail();
    } catch (error) {
      assert(error.toString().indexOf('invalid') !== -1);
    }
  });

  it('open() must not throw error if password is correct', async () => {
    try {
      await lpmStore.open(testPassword);
      assert.ok(true);
    } catch (error) {
      assert.fail();
    }
  });

  it('savePassword() should alter password', async () => {
    await lpmStore.savePassword(0, 'web2', 'un2', 'pw2');
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

    try {
      await lpmStore.open(testPassword);
      assert.fail();
    } catch (error) {
      assert(error.toString().indexOf('corrupted') !== -1);
    }
  });
});
