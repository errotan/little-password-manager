//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

import { strict as assert } from 'assert';
import { promises as fs } from 'fs';
import jsdomGlobal from 'jsdom-global';
import helper from './helper';
import lpmMain from '../src/main';
import { NwWindow, NwClipboard } from '../spec/nw';
import Clipboard from './clipboard';
import Window from './window';

const windowEmitter = new Window();
const clipboard = new Clipboard();
const tempPassword = 'secret54321';

describe('lpm.main', () => {
  before(async () => {
    await helper.deleteStoreFile();

    // create browser env
    jsdomGlobal(await fs.readFile('index.html', 'utf8'));

    // call init
    lpmMain((<NwWindow> windowEmitter), (<NwClipboard> clipboard), document, helper.tempStoreFile);
  });

  after(async () => helper.deleteStoreFile());

  it('password again shown on first start', () => {
    assert.strictEqual(
      document.getElementsByClassName('js-password-again').item(0)!.classList.contains('hidden'),
      false,
    );
  });

  it('after login passwords are listed', () => {
    (<HTMLInputElement> document.getElementById('loginpassword')).value = tempPassword;
    (<HTMLInputElement> document.getElementById('loginpassword2')).value = tempPassword;
    document.getElementById('loginsubmit')!.click();

    assert.strictEqual(
      document.getElementsByClassName('table').item(0)!.classList.contains('hidden'),
      false,
    );
  });

  it('adding entry creates row', () => {
    const inputs = document.getElementsByClassName('form-control');
    const table = document.getElementsByTagName('table').item(0)!;

    (<HTMLInputElement> inputs.item(3)).value = 'un';
    (<HTMLInputElement> inputs.item(4)).value = 'web';
    (<HTMLInputElement> inputs.item(5)).value = 'pw';
    (<HTMLInputElement> inputs.item(6)).click();

    helper.mutationObserve(table, () => {
      assert.strictEqual(table.getElementsByTagName('tr').length, 3);
    });
  });

  it('delete removes row', (done) => {
    const inputs = document.getElementsByClassName('form-control');
    const table = document.getElementsByTagName('table').item(0)!;

    (<HTMLInputElement> inputs.item(3)).value = 'un2';
    (<HTMLInputElement> inputs.item(5)).value = 'pw2';
    (<HTMLElement> inputs.item(6)).click();

    helper.mutationObserve(table, () => {
      assert.strictEqual(table.getElementsByTagName('tr').length, 4);

      const firstTrashIcon = (<HTMLElement> document.getElementsByClassName('ion-md-trash').item(0));
      firstTrashIcon.dataset.confirmed = <string><unknown> true;
      firstTrashIcon.click();

      helper.mutationObserve(table, () => {
        assert.strictEqual(table.getElementsByTagName('tr').length, 3);
        done();
      });
    });
  });

  it('clicking edit creates input fields', () => {
    assert.strictEqual(document.getElementsByClassName('form-control').length, 7);

    (<HTMLElement> document.getElementsByClassName('ion-md-create').item(0)).click();

    assert.strictEqual(document.getElementsByClassName('form-control').length, 10);
  });

  it('clicking cancel removes input fields', () => {
    assert.strictEqual(document.getElementsByClassName('form-control').length, 10);

    (<HTMLElement> document.getElementsByClassName('ion-md-close').item(0)).click();

    assert.strictEqual(document.getElementsByClassName('form-control').length, 7);
  });

  it('minimize clears table', () => {
    windowEmitter.on('minimize', () => {
      assert.strictEqual(
        document.getElementsByTagName('table').item(0)!.getElementsByTagName('tr').length,
        2,
      );
    });

    windowEmitter.emit('minimize');
  });
});
