//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const fs = require('fs');
const CryptoJS = require('crypto-js');

let storeFilePath = 'passwords.json';

// main password used for encryption/decryption
let mainPassword = '';

// this object holds all passwords
let passwords = {};

function setStoreFilePath(path) {
  storeFilePath = path;
}

function setMainPassword(password) {
  mainPassword = password;
}

function passwordFileExists() {
  return fs.existsSync(storeFilePath);
}

function passwordValid() {

  readPasswordFile();

  if (!passwordCheck()) {
    return false;
  }

  processRows('decrypt');

  return true;
}

function getPasswords() {
  return passwords.list;
}

function savePassword(id, web, un, pw) {
  passwords.list[id].web = web;
  passwords.list[id].un = un;
  passwords.list[id].pw = pw;

  savePasswords();
}

function deletePassword(id) {

  passwords.list.splice(id, 1);

  savePasswords();
}

function addPassword(web, un, pw) {
  if (typeof passwords.list === 'undefined') {

    passwords.list = [];

  }

  passwords.list.push({web: web, un: un, pw: pw});

  savePasswords();
}

function reset() {
  mainPassword = '';
  passwords = {};
}

// save passwords to json file
function savePasswords() {

  // sort array
  passwords.list.sort(function (a, b) {
    return a.web.localeCompare(b.web);
  });

  processRows('encrypt');

  fs.writeFileSync(storeFilePath, JSON.stringify(passwords), 'utf8');

  processRows('decrypt');

}

// encrypt or decrypt rows
function processRows(type) {

  for (let i = 0; i < passwords.list.length; i++) {

    if (type === 'encrypt') {

      encryptEntry(i, 'web');
      encryptEntry(i, 'un');
      encryptEntry(i, 'pw');

    } else {

      decryptEntry(i, 'web');
      decryptEntry(i, 'un');
      decryptEntry(i, 'pw');

    }
  }
}

function encryptEntry(id, index) {

  if (passwords.list[id][index].length > 0) {

    passwords.list[id][index] = encryptString(passwords.list[id][index]);

  } else {

    passwords.list[id][index] = '';

  }
}

function decryptEntry(id, index) {

  if (passwords.list[id][index].length > 0) {

    passwords.list[id][index] = decryptString(passwords.list[id][index]);

  }

  return passwords.list[id][index];

}

// read password file, parse and load to passwords object
function readPasswordFile() {

  let data = fs.readFileSync(storeFilePath, 'utf8').toString();

  try {

    passwords = JSON.parse(data);

  } catch (e) {

    alert('Fatal error! Password file is corrupted!');

    throw new Error('Fatal error! Password file is corrupted!');

  }
}

function passwordCheck() {

  if (typeof passwords.list !== 'undefined' && passwords.list.length) {

    return decryptString(passwords.list[0].pw).length;

  }
}

function encryptString(string) {
  return CryptoJS.AES.encrypt(string, mainPassword).toString();
}

function decryptString(string) {
  return CryptoJS.AES.decrypt(string, mainPassword).toString(CryptoJS.enc.Utf8);
}

module.exports = {
  setStoreFilePath: setStoreFilePath,
  setMainPassword: setMainPassword,
  passwordFileExists: passwordFileExists,
  passwordValid: passwordValid,
  getPasswords: getPasswords,
  savePassword: savePassword,
  deletePassword: deletePassword,
  addPassword: addPassword,
  reset: reset
};
