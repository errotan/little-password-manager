//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

import lpmStore from './store';
import { NwWindow, NwClipboard } from '../spec/nw';

// nw window instance
let win: NwWindow;

// nw clipboard instance
let clipboard: NwClipboard;

// DOM instance
let dom: Document;

let confirmTarget: HTMLElement;

function displayText(title: string, text: string, isQuestion: boolean = false) {
  const confirmButton = dom.getElementById('confirm_button')!.classList;

  if (isQuestion) {
    confirmButton.remove('d-none');
  } else {
    confirmButton.add('d-none');
  }

  dom.getElementsByClassName('modal-title').item(0)!.innerHTML = title;
  dom.getElementsByClassName('modal-body').item(0)!.innerHTML = text;
  dom.getElementById('modal_button')!.click();
}

function displayNotice(text: string) {
  displayText('Notice', text);
}

function displayError(text: string) {
  displayText('Error', text);
}

function displayQuestion(text: string) {
  displayText('Question', text, true);
}

// clear password list table
function clearMainTable() {
  const mainTableTbody = dom.getElementsByTagName('table')
    .item(0)!
    .getElementsByTagName('tbody')
    .item(0);
  const passwordRows = mainTableTbody!.getElementsByTagName('tr');

  for (let i = passwordRows.length - 2; i >= 0; i -= 1) {
    mainTableTbody!.removeChild(passwordRows[i]);
  }
}

function copyToClipboard(element: HTMLElement) {
  clipboard.set(<string> element.parentElement!.parentElement!.dataset.pw);
  displayNotice('Password copied!');
}

// password shower
function showHidePassword(element: HTMLElement) {
  const tr = (<HTMLTableRowElement> element.parentElement!.parentElement);

  if (element.classList.contains('ion-md-eye')) {
    element.classList.remove('ion-md-eye');
    element.classList.add('ion-md-eye-off');

    tr.cells.item(2)!.innerHTML = <string> tr.dataset.pw;
  } else {
    element.classList.remove('ion-md-eye-off');
    element.classList.add('ion-md-eye');

    tr.cells.item(2)!.innerHTML = '***';
  }
}

function displayEmptyWarning() {
  dom.getElementsByClassName('js-empty-warning').item(0)!.classList.remove('d-none');
}

function hideEmptyWarning() {
  dom.getElementsByClassName('js-empty-warning').item(0)!.classList.add('d-none');
}

// draw password list table
function drawPasswordList() {
  // hide login form
  dom.getElementsByTagName('form').item(0)!.classList.add('d-none');

  // clear password list table
  clearMainTable();

  // show password list table
  const mainTable = dom.getElementsByTagName('table').item(0);

  mainTable!.classList.remove('d-none');

  const passwords = lpmStore.getPasswords();

  if (passwords !== undefined) {
    const mainTableBody = mainTable!.getElementsByTagName('tbody').item(0);

    for (let i = 0; i < passwords.length; i += 1) {
      const row = mainTableBody!.insertRow(i);
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);

      // center option icons
      cell4.classList.add('text-center');

      // save id
      row.dataset.id = <string><unknown> i;

      // save datas
      row.dataset.web = passwords[i].web;
      row.dataset.un = passwords[i].un;
      row.dataset.pw = passwords[i].pw;

      cell1.innerHTML = passwords[i].web;
      cell2.innerHTML = passwords[i].un;
      cell3.innerHTML = '***';
      cell4.innerHTML = '<i class="icon ion-md-clipboard" title="copy to clipboard"></i> '
        + '<i class="icon ion-md-eye" title="show/hide"></i> '
        + '<i class="icon ion-md-create" title="edit"></i> '
        + '<i class="icon ion-md-trash" title="delete"></i>';
    }
  }

  if (passwords && passwords.length === 0) {
    displayEmptyWarning();
  } else {
    hideEmptyWarning();
  }
}

// make input fields for password row edit
function editPassword(element: HTMLElement) {
  const tr = (<HTMLTableRowElement> element.parentElement!.parentElement);

  tr.cells.item(0)!.innerHTML = '<input class="form-control" type="text" />';
  tr.cells.item(1)!.innerHTML = '<input class="form-control" type="text" />';
  tr.cells.item(2)!.innerHTML = '<input class="form-control" type="text" />';
  tr.cells.item(3)!.innerHTML = '<i class="icon ion-md-checkmark"></i> <i class="icon ion-md-close"></i>';

  (<HTMLInputElement> tr.cells.item(0)!.children.item(0)).value = <string> tr.dataset.web;
  (<HTMLInputElement> tr.cells.item(1)!.children.item(0)).value = <string> tr.dataset.un;
  (<HTMLInputElement> tr.cells.item(2)!.children.item(0)).value = <string> tr.dataset.pw;
}

// save edited password
async function saveEditedPassword(element: HTMLElement) {
  const tr = (<HTMLTableRowElement> element.parentElement!.parentElement);
  const input = tr.getElementsByTagName('input');
  confirmTarget = element;

  if ('confirmed' in confirmTarget.dataset) {
    delete confirmTarget.dataset.confirmed;
    await lpmStore.savePassword(
      <number><unknown> tr.dataset.id,
      input.item(0)!.value,
      input.item(1)!.value,
      input.item(2)!.value,
    );
    drawPasswordList();
  } else {
    displayQuestion('Do you really want to save this data?');
  }
}

// password delete handler
async function deletePassword(element: HTMLElement) {
  confirmTarget = element;

  if ('confirmed' in confirmTarget.dataset) {
    delete confirmTarget.dataset.confirmed;

    await lpmStore.deletePassword(
      <number><unknown> element.parentElement!.parentElement!.dataset.id,
    );

    drawPasswordList();
  } else {
    displayQuestion('Do you really want to delete this data?');
  }
}

// login handler
async function loginHandler() {
  const loginPassword = <HTMLInputElement> dom.getElementById('loginpassword');

  try {
    await lpmStore.open(loginPassword.value);
  } catch (e) {
    displayError(e);
    return;
  }

  if (!await lpmStore.passwordFileValid()) {
    const loginPassword2 = <HTMLInputElement> dom.getElementById('loginpassword2');

    if (loginPassword.value.length < 8) {
      displayNotice('Password needs to be atleast 8 character long!');
    } else if (loginPassword.value === loginPassword2.value) {
      // passwords match

      // clear password fields
      loginPassword.value = '';
      loginPassword2.value = '';

      // maximize window
      win.maximize();

      // draw password list table
      drawPasswordList();
    } else {
      displayNotice('Passwords don\'t match!');
    }

    return;
  }

  // clear password field
  loginPassword.value = '';

  // maximize window
  win.maximize();

  drawPasswordList();
}

// new password save handler
async function saveNewPassword() {
  const inputFields = dom.getElementsByTagName('table').item(0)!.getElementsByTagName('input');

  if ((inputFields[0].value !== '' || inputFields[1].value !== '') && inputFields[2].value) {
    await lpmStore.addPassword(inputFields[0].value, inputFields[1].value, inputFields[2].value);

    // clear fields
    inputFields[0].value = '';
    inputFields[1].value = '';
    inputFields[2].value = '';

    drawPasswordList();

    displayNotice('Store successful!');
  } else {
    displayNotice('Atleast web page or username plus password need to be set to store!');
  }
}

// add event listeners
function addListeners() {
  // click handlers
  dom.addEventListener('click', (e) => {
    const clickTarget = <HTMLElement> e.target;

    // delete event
    if (clickTarget.classList.contains('ion-md-clipboard')) {
      copyToClipboard(clickTarget);
    }

    // show/hide event
    if (clickTarget.classList.contains('ion-md-eye') || clickTarget.classList.contains('ion-md-eye-off')) {
      showHidePassword(clickTarget);
    }

    // edit event
    if (clickTarget.classList.contains('ion-md-create')) {
      editPassword(clickTarget);
    }

    // edit finish event
    if (clickTarget.classList.contains('ion-md-checkmark')) {
      saveEditedPassword(clickTarget);
    }

    // edit cancel event
    if (clickTarget.classList.contains('ion-md-close')) {
      drawPasswordList();
    }

    // delete event
    if (clickTarget.classList.contains('ion-md-trash')) {
      deletePassword(clickTarget);
    }

    // confirm event
    if (clickTarget.id === 'confirm_button' && confirmTarget) {
      confirmTarget.dataset.confirmed = <string><unknown> true;
      confirmTarget.click();
    }
  });

  // form submit handlers
  dom.addEventListener('submit', (e) => {
    // prevent page navigation
    e.preventDefault();

    if (typeof (<HTMLFormElement> e.target).dataset.login !== 'undefined') {
      loginHandler();
    } else {
      saveNewPassword();
    }
  });
}

// password again shower/hider for first time run
async function passwordAgainFieldHandler() {
  const passwordDiv = dom.getElementsByClassName('js-password-again').item(0)!;
  const loginSubmit = (<HTMLInputElement> dom.getElementById('loginsubmit'));
  const passwordFileValid = await lpmStore.passwordFileValid();

  if (passwordFileValid) {
    passwordDiv.classList.add('d-none');
  } else {
    passwordDiv.classList.remove('d-none');
  }

  loginSubmit.value = passwordFileValid ? 'Unlock' : 'Create';
}

// logout handler
function logout() {
  // show login form
  dom.getElementsByTagName('form').item(0)!.classList.remove('d-none');

  // hide password list table
  const mainTable = dom.getElementsByTagName('table').item(0)!;

  mainTable.classList.add('d-none');

  lpmStore.close();

  // clear password list table
  clearMainTable();
}

// attach resize, minimize handlers
function attachWindowHandlers() {
  // lock on minimize
  win.on('minimize', () => {
    passwordAgainFieldHandler();
    logout();
  });

  // shrink size and move to center on restore
  win.on('restore', () => {
    win.resizeTo(510, 410);
    win.setPosition('center');
  });
}

export = function init(nw: NwWindow, clip: NwClipboard, doc: Document, filePath: string) {
  win = nw;
  clipboard = clip;
  dom = doc;

  if (filePath !== undefined) {
    lpmStore.setFilePath(filePath);
  }

  attachWindowHandlers();
  passwordAgainFieldHandler();
  addListeners();
};
