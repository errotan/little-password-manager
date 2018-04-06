/*

MIT License

Copyright (c) 2017 Puskás Zsolt <errotan@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

'use strict';

// require NW.js
if (typeof nw === 'undefined') {
  throw new Error('This application needs to be run in NW.js!');
}

var lpm = (function () {

  // nw instance object
  var win = nw.Window.get();

  // main password used for encryption/decryption
  var mainPassword = '';

  // this object holds all passwords
  var passwords = {};

  // init file system object
  var fs = require('fs');

  // init page
  function init() {

    // password again shower/hider for first time run
    passwordAgain();

    // option event listener
    document.addEventListener('click', function(e) {

      // show/hide event
      if (e.srcElement.classList.contains('glyphicon-eye-open') || e.srcElement.classList.contains('glyphicon-eye-close')) {

        showHidePassword(e.srcElement);

      }

      // edit event
      if (e.srcElement.classList.contains('glyphicon-pencil')) {

        editPassword(e.srcElement);

      }

      // edit finish event
      if (e.srcElement.classList.contains('glyphicon-ok')) {

        saveEditedPassword(e.srcElement);

      }

      // edit cancel event
      if (e.srcElement.classList.contains('glyphicon-remove')) {

        drawPasswordList();

      }

      // delete event
      if (e.srcElement.classList.contains('glyphicon-trash')) {

        deletePassword(e.srcElement);

      }
    });

    var forms = document.getElementsByTagName('form');

    // add login submit event listener
    forms.item(0).addEventListener('submit', function(e) {

      // prevent page navigation
      e.preventDefault();

      // login handler
      loginHandler();

    });

    // add new password save event listener
    forms.item(1).addEventListener('submit', function(e) {

      // prevent page navigation
      e.preventDefault();

      // new password save handler
      saveNewPassword();

    });
  }

  // read password file, parse and load to passwords object
  function readPasswordFile() {

    // load password file
    var data = fs.readFileSync('passwords.json', 'utf8').toString();

    // try json parse
    try {

      passwords = JSON.parse(data);

    } catch (e) {

      console.error('Password file is corrupted!');

      alert('Password file is corrupted!');

      return false;

    }

    return true;

  }

  // check password
  function passwordCheck() {

    if (typeof passwords.list !== 'undefined' && passwords.list.length) {

      return CryptoJS.AES.decrypt(passwords.list[0].pw, mainPassword).toString(CryptoJS.enc.Utf8).length;

    }
  }

  // login handler
  function loginHandler() {

    var loginPassword = document.getElementById('loginpassword');

    // save password
    mainPassword = loginPassword.value;

    if ( ! fs.existsSync('passwords.json')) {

      var loginPassword2 = document.getElementById('loginpassword2');

      if (loginPassword.value.length < 8) {

        alert('Password needs to be atleast 8 character long!');

      } else if (loginPassword.value === loginPassword2.value) {

        // passwords match

        // clear password fields
        loginPassword.value  = '';
        loginPassword2.value = '';

        // maximize window
        win.maximize();

        // draw password list table
        drawPasswordList();

      } else {

        alert('Passwords don\'t match!');

      }

    } else {

      // read password file
      if (readPasswordFile()) {

        // check password
        if (passwordCheck()) {

          decryptPasswords();

          // clear password field
          loginPassword.value = '';

          // maximize window
          win.maximize();

          drawPasswordList();

        } else {

          alert('Password is invalid!');

        }
      }
    }
  }

  // draw password list table
  function drawPasswordList() {

    // hide login form
    document.getElementsByTagName('form').item(0).classList.add('hidden');

    // clear password list table
    clearMainTable();

    // show password list table
    var mainTable = document.getElementsByTagName('table').item(0);

    mainTable.classList.remove('hidden');

    if (typeof passwords.list !== 'undefined') {

      var mainTableBody = mainTable.getElementsByTagName('tbody').item(0);

      for (var i = 0; i < passwords.list.length; i++) {

        var row   = mainTableBody.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        // center option icons
        cell4.classList.add('text-center');

        // save id
        row.dataset.id = i;

        // save datas
        row.dataset.web = passwords.list[i].web;
        row.dataset.un  = passwords.list[i].un;
        row.dataset.pw  = passwords.list[i].pw;

        cell1.innerHTML = passwords.list[i].web;
        cell2.innerHTML = passwords.list[i].un;
        cell3.innerHTML = '***';
        cell4.innerHTML = '<span class="glyphicon glyphicon-eye-open" role="button" aria-hidden="true"></span> ' +
                          '<span class="glyphicon glyphicon-pencil" role="button" aria-hidden="true"></span> ' +
                          '<span class="glyphicon glyphicon-trash" role="button" aria-hidden="true"></span>';

      }
    }
  }

  // password shower
  function showHidePassword(element) {

    var tr = element.parentElement.parentElement;

    if (element.classList.contains('glyphicon-eye-open')) {

      element.classList.remove('glyphicon-eye-open');
      element.classList.add('glyphicon-eye-close');

      tr.cells.item(2).innerHTML = tr.dataset.pw;

    } else {

      element.classList.remove('glyphicon-eye-close');
      element.classList.add('glyphicon-eye-open');

      tr.cells.item(2).innerHTML = '***';

    }
  }

  // make input fields for password row edit
  function editPassword(element) {

    var tr = element.parentElement.parentElement;

    tr.cells.item(0).innerHTML = '<input class="form-control" type="text" value="' + tr.dataset.web + '" />';
    tr.cells.item(1).innerHTML = '<input class="form-control" type="text" value="' + tr.dataset.un + '" />';
    tr.cells.item(2).innerHTML = '<input class="form-control" type="text" value="' + tr.dataset.pw + '" />';
    tr.cells.item(3).innerHTML = '<span class="glyphicon glyphicon-ok" role="button" aria-hidden="true"></span> ' +
                                 '<span class="glyphicon glyphicon-remove" role="button" aria-hidden="true"></span>';

  }

  // save edited password
  function saveEditedPassword(element) {

    if (confirm('Do you really want to save this data?')) {

      var tr  = element.parentElement.parentElement;
      var id  = tr.dataset.id;

      passwords.list[id].web = tr.getElementsByTagName('input').item(0).value;
      passwords.list[id].un  = tr.getElementsByTagName('input').item(1).value;
      passwords.list[id].pw  = tr.getElementsByTagName('input').item(2).value;

      savePasswords();

      drawPasswordList();

    }
  }

  // password delete handler
  function deletePassword(element) {

    if (confirm('Do you really want to delete this data?')) {

      // remove element
      passwords.list.splice(element.parentElement.parentElement.dataset.id, 1);

      savePasswords();

      drawPasswordList();

    }
  }

  // new password save handler
  function saveNewPassword() {

    var inputFields = document.getElementsByTagName('table').item(0).getElementsByTagName('input');

    if ((inputFields[0].value !== '' || inputFields[1].value !== '') && inputFields[2].value) {

      if (typeof passwords.list === 'undefined') {

        passwords.list = [];

      }

      // add new data to list
      passwords.list.push({web: inputFields[0].value, un: inputFields[1].value, pw: inputFields[2].value});

      // clear fields
      inputFields[0].value = '';
      inputFields[1].value = '';
      inputFields[2].value = '';

      savePasswords();

      alert('Store successfull!');

    } else {

      alert('Atleast web page or username plus password need to be set to store!');

    }
  }

  // save passwords to json file
  function savePasswords() {

    // sort array
    passwords.list.sort(function(a, b) { return a.web.localeCompare(b.web); })

    encryptPasswords();

    fs.writeFile('passwords.json', JSON.stringify(passwords), 'utf8');

    decryptPasswords();

    drawPasswordList();

  }

  // encrypt passwords
  function encryptPasswords() {

    for (var i = 0; i < passwords.list.length; i++) {

      if (passwords.list[i].web.length > 0) {

        passwords.list[i].web = CryptoJS.AES.encrypt(passwords.list[i].web, mainPassword).toString();

      }

      if (passwords.list[i].un.length > 0) {

        passwords.list[i].un = CryptoJS.AES.encrypt(passwords.list[i].un, mainPassword).toString();

      }

      passwords.list[i].pw = CryptoJS.AES.encrypt(passwords.list[i].pw, mainPassword).toString();

    }
  }

  // decrypt passwords
  function decryptPasswords() {

    for (var i = 0; i < passwords.list.length; i++) {

      if (passwords.list[i].web.length > 0) {

        passwords.list[i].web = CryptoJS.AES.decrypt(passwords.list[i].web, mainPassword).toString(CryptoJS.enc.Utf8);

      }

      if (passwords.list[i].un.length > 0) {

        passwords.list[i].un = CryptoJS.AES.decrypt(passwords.list[i].un, mainPassword).toString(CryptoJS.enc.Utf8);

      }

      passwords.list[i].pw = CryptoJS.AES.decrypt(passwords.list[i].pw, mainPassword).toString(CryptoJS.enc.Utf8);

    }
  }

  // password again shower/hider for first time run
  function passwordAgain() {

    var passwordDiv = document.getElementsByClassName('js-password-again').item(0);
    var sideDivs    = document.getElementsByClassName('js-form-side');
    var loginSubmit = document.getElementById('loginsubmit');

    // check password file existance
    if ( ! fs.existsSync('passwords.json')) {

      // not present, change to first time password set mode

      // unhide password again input field
      passwordDiv.classList.remove('hidden');

      // change side divs to smaller
      sideDivs[0].classList.remove('col-xs-3');
      sideDivs[0].classList.add('col-xs-1');
      sideDivs[1].classList.remove('col-xs-3');
      sideDivs[1].classList.add('col-xs-1');

      // change submit button text
      loginSubmit.value = 'Create';

    } else {

      // present, change to normal mode

      // unhide password again input field
      passwordDiv.classList.add('hidden');

      // change side divs to bigger
      sideDivs[0].classList.remove('col-xs-1');
      sideDivs[0].classList.add('col-xs-3');
      sideDivs[1].classList.remove('col-xs-1');
      sideDivs[1].classList.add('col-xs-3');

      // change submit button text
      loginSubmit.value = 'Unlock';

    }
  }

  // logout handler
  function logout() {

    // show login form
    document.getElementsByTagName('form').item(0).classList.remove('hidden');

    // hide password list table
    var mainTable = document.getElementsByTagName('table').item(0);

    mainTable.classList.add('hidden');

    // clear passwords
    mainPassword = '';
    passwords    = {};

    // clear password list table
    clearMainTable();
  }

  // clear password list table
  function clearMainTable() {

    var mainTableTbody = document.getElementsByTagName('table').item(0).getElementsByTagName('tbody').item(0);
    var passwordRows   = mainTableTbody.getElementsByTagName('tr');

    for (var i = passwordRows.length - 2; i >= 0; i--) {

        mainTableTbody.removeChild(passwordRows[i]);

    }
  }

  // lock on minimize 
  win.on('minimize', function() {

    // password again shower/hider for first time run
    passwordAgain();

    logout();

  });

  // shrink size and move to center on restore
  win.on('restore', function() {

    win.resizeTo(510, 410);
    win.setPosition('center');

  });

  // expose init method only
  return {
    init: init
  }

})();

// wait for dom load than init page
document.addEventListener('DOMContentLoaded', function() { lpm.init(); });
