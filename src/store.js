//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const fs = require('fs');
const CryptoJS = require('crypto-js');

let storeFilePath = 'passwords.json';

// main password used for encryption/decryption
let mainPassword = '';

// this object holds all passwords
let passwords = {};

function passwordFileExists() {
  return fs.existsSync(storeFilePath);
}

// read password file, parse and load to passwords object
function readPasswordFile() {
  const data = fs.readFileSync(storeFilePath, 'utf8');

  try {
    passwords = JSON.parse(data);
  } catch (e) {
    throw new Error('Fatal error! Password file is corrupted!');
  }
}

function decryptString(string) {
  return CryptoJS.AES.decrypt(string, mainPassword).toString(CryptoJS.enc.Utf8);
}

function encryptString(string) {
  return CryptoJS.AES.encrypt(string, mainPassword).toString();
}

function passwordValid() {
  if (typeof passwords.list !== 'undefined' && passwords.list.length) {
    return decryptString(passwords.list[0].pw).length !== 0;
  }
  return false;
}

function decryptEntry(id, index) {
  if (passwords.list[id][index].length > 0) {
    passwords.list[id][index] = decryptString(passwords.list[id][index]);
  }

  return passwords.list[id][index];
}

function encryptEntry(id, index) {
  if (passwords.list[id][index].length > 0) {
    passwords.list[id][index] = encryptString(passwords.list[id][index]);
  } else {
    passwords.list[id][index] = '';
  }
}

// encrypt or decrypt rows
function processRows(type) {
  for (let i = 0; i < passwords.list.length; i += 1) {
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

function open(password, path) {
  mainPassword = password;

  if (path !== undefined) {
    storeFilePath = path;
  }

  if (passwordFileExists()) {
    readPasswordFile();

    if (passwordValid()) {
      processRows('decrypt');
    } else {
      throw new Error('Password invalid!');
    }
  }
}

function getPasswords() {
  return passwords.list;
}

// save passwords to json file
function savePasswords() {
  // sort array
  passwords.list.sort((a, b) => a.web.localeCompare(b.web));

  processRows('encrypt');

  fs.writeFileSync(storeFilePath, JSON.stringify(passwords), 'utf8');

  processRows('decrypt');
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
  if (passwords.list === undefined) {
    passwords.list = [];
  }

  passwords.list.push({ web, un, pw });

  savePasswords();
}

function reset() {
  mainPassword = '';
  passwords = {};
}

module.exports = {
  passwordFileExists,
  open,
  getPasswords,
  savePassword,
  deletePassword,
  addPassword,
  reset,
};
