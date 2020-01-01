//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const lpmStore = require('./lpm.store.js');

// nw instance
let win;

// DOM instance
let dom;

function init(nw, doc, storeFilePath) {

  win = nw;
  dom = doc;

  if (typeof storeFilePath !== 'undefined') {
    lpmStore.setStoreFilePath(storeFilePath);
  }

  attachWindowHandlers();
  passwordAgainFieldHandler();
  addListeners();

}

// add event listeners
function addListeners() {

  // click handlers
  dom.addEventListener('click', function (e) {

    // show/hide event
    if (e.target.classList.contains('ion-md-eye') || e.target.classList.contains('ion-md-eye-off')) {

      showHidePassword(e.target);

    }

    // edit event
    if (e.target.classList.contains('ion-md-create')) {

      editPassword(e.target);

    }

    // edit finish event
    if (e.target.classList.contains('ion-md-checkmark')) {

      saveEditedPassword(e.target);

    }

    // edit cancel event
    if (e.target.classList.contains('ion-md-close')) {

      drawPasswordList();

    }

    // delete event
    if (e.target.classList.contains('ion-md-trash')) {

      deletePassword(e.target);

    }
  });

  // form submit handlers
  dom.addEventListener('submit', function (e) {

    // prevent page navigation
    e.preventDefault();

    if (typeof e.target.dataset.login !== 'undefined') {

      loginHandler();

    } else {

      saveNewPassword();

    }
  });
}

// login handler
function loginHandler() {

  let loginPassword = dom.getElementById('loginpassword');

  lpmStore.setMainPassword(loginPassword.value);

  if (!lpmStore.passwordFileExists()) {

    let loginPassword2 = dom.getElementById('loginpassword2');

    if (loginPassword.value.length < 8) {

      alert('Password needs to be atleast 8 character long!');

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

      alert('Passwords don\'t match!');

    }

    return;

  }

  if (lpmStore.passwordValid()) {

    // clear password field
    loginPassword.value = '';

    // maximize window
    win.maximize();

    drawPasswordList();

  } else {

    alert('Password is invalid!');

  }
}

// draw password list table
function drawPasswordList() {

  // hide login form
  dom.getElementsByTagName('form').item(0).classList.add('d-none');

  // clear password list table
  clearMainTable();

  // show password list table
  let mainTable = dom.getElementsByTagName('table').item(0);

  mainTable.classList.remove('d-none');

  let passwords = lpmStore.getPasswords();

  if (typeof passwords !== 'undefined') {

    let mainTableBody = mainTable.getElementsByTagName('tbody').item(0);

    for (let i = 0; i < passwords.length; i++) {

      let row = mainTableBody.insertRow(i);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);

      // center option icons
      cell4.classList.add('text-center');

      // save id
      row.dataset.id = i;

      // save datas
      row.dataset.web = passwords[i].web;
      row.dataset.un = passwords[i].un;
      row.dataset.pw = passwords[i].pw;

      cell1.innerHTML = passwords[i].web;
      cell2.innerHTML = passwords[i].un;
      cell3.innerHTML = '***';
      cell4.innerHTML = '<i class="icon ion-md-eye"></i> <i class="icon ion-md-create"></i> ' +
        '<i class="icon ion-md-trash"></i>';
    }
  }
}

// password shower
function showHidePassword(element) {

  let tr = element.parentElement.parentElement;

  if (element.classList.contains('ion-md-eye')) {

    element.classList.remove('ion-md-eye');
    element.classList.add('ion-md-eye-off');

    tr.cells.item(2).innerHTML = tr.dataset.pw;

  } else {

    element.classList.remove('ion-md-eye-off');
    element.classList.add('ion-md-eye');

    tr.cells.item(2).innerHTML = '***';

  }
}

// make input fields for password row edit
function editPassword(element) {

  let tr = element.parentElement.parentElement;

  tr.cells.item(0).innerHTML = '<input class="form-control" type="text" value="' + tr.dataset.web + '" />';
  tr.cells.item(1).innerHTML = '<input class="form-control" type="text" value="' + tr.dataset.un + '" />';
  tr.cells.item(2).innerHTML = '<input class="form-control" type="text" value="' + tr.dataset.pw + '" />';
  tr.cells.item(3).innerHTML = '<i class="icon ion-md-checkmark"></i> ' +
    '<i class="icon ion-md-close"></i>';

}

// save edited password
function saveEditedPassword(element) {

  if (confirm('Do you really want to save this data?')) {

    let tr = element.parentElement.parentElement;

    lpmStore.savePassword(
      tr.dataset.id,
      tr.getElementsByTagName('input').item(0).value,
      tr.getElementsByTagName('input').item(1).value,
      tr.getElementsByTagName('input').item(2).value
    );

    drawPasswordList();

  }
}

// password delete handler
function deletePassword(element) {

  if (confirm('Do you really want to delete this data?')) {

    lpmStore.deletePassword(element.parentElement.parentElement.dataset.id);

    drawPasswordList();

  }
}

// new password save handler
function saveNewPassword() {

  let inputFields = dom.getElementsByTagName('table').item(0).getElementsByTagName('input');

  if ((inputFields[0].value !== '' || inputFields[1].value !== '') && inputFields[2].value) {

    lpmStore.addPassword(inputFields[0].value, inputFields[1].value, inputFields[2].value);

    // clear fields
    inputFields[0].value = '';
    inputFields[1].value = '';
    inputFields[2].value = '';

    drawPasswordList();

    alert('Store successfull!');

  } else {

    alert('Atleast web page or username plus password need to be set to store!');

  }
}

// password again shower/hider for first time run
function passwordAgainFieldHandler() {

  let passwordDiv = dom.getElementsByClassName('js-password-again').item(0);
  let loginSubmit = dom.getElementById('loginsubmit');
  let passwordFileExists = lpmStore.passwordFileExists();

  if (passwordFileExists) {

    passwordDiv.classList.add('d-none');

  } else {

    passwordDiv.classList.remove('d-none');

  }

  loginSubmit.value = passwordFileExists ? 'Unlock' : 'Create';

}

// logout handler
function logout() {

  // show login form
  dom.getElementsByTagName('form').item(0).classList.remove('d-none');

  // hide password list table
  let mainTable = dom.getElementsByTagName('table').item(0);

  mainTable.classList.add('d-none');

  lpmStore.reset();

  // clear password list table
  clearMainTable();
}

// clear password list table
function clearMainTable() {

  let mainTableTbody = dom.getElementsByTagName('table').item(0).getElementsByTagName('tbody').item(0);
  let passwordRows = mainTableTbody.getElementsByTagName('tr');

  for (let i = passwordRows.length - 2; i >= 0; i--) {

    mainTableTbody.removeChild(passwordRows[i]);

  }
}

// attach resize, minimize handlers
function attachWindowHandlers() {

  // lock on minimize 
  win.on('minimize', function () {

    passwordAgainFieldHandler();
    logout();

  });

  // shrink size and move to center on restore
  win.on('restore', function () {

    win.resizeTo(510, 410);
    win.setPosition('center');

  });
}

module.exports = init;
