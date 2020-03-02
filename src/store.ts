//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

import { promises as fs } from 'fs';
import CryptoJS from 'crypto-js';

let storeFilePath = 'passwords.json';
let mainPassword;
let passwords;

function setFilePath(path) {
  if (passwords) {
    throw new Error('Close store before changing path!');
  }

  storeFilePath = path;
}

async function passwordFileExists() {
  try {
    await fs.access(storeFilePath);
    return true;
  } catch (error) {
    return false;
  }
}

// read password file, parse and load to passwords object
async function readPasswordFile() {
  let data;

  try {
    data = await fs.readFile(storeFilePath, 'utf8');
  } catch (e) {
    throw new Error('Fatal error! Can\'t read password file!');
  }

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

async function open(password) {
  mainPassword = password;

  if (await passwordFileExists()) {
    await readPasswordFile();

    try {
      if (passwordValid()) {
        processRows('decrypt');
      } else {
        throw new Error();
      }
    } catch (error) {
      throw new Error('Password invalid!');
    }
  } else {
    passwords = {};
  }
}

function checkOpen() {
  if (!passwords) {
    throw new Error('Store must be opened first!');
  }
}

function getPasswords() {
  checkOpen();

  return passwords.list;
}

// save passwords to json file
async function savePasswords() {
  // sort array
  passwords.list.sort((a, b) => a.web.localeCompare(b.web));

  processRows('encrypt');

  try {
    await fs.writeFile(storeFilePath, JSON.stringify(passwords), 'utf8');
  } catch (error) {
    throw new Error('Fatal error! Can\'t save password file!');
  }

  processRows('decrypt');
}

async function savePassword(id, web, un, pw) {
  checkOpen();

  passwords.list[id].web = web;
  passwords.list[id].un = un;
  passwords.list[id].pw = pw;

  await savePasswords();
}

async function deletePassword(id) {
  checkOpen();

  passwords.list.splice(id, 1);

  await savePasswords();
}

async function addPassword(web, un, pw) {
  checkOpen();

  if (passwords.list === undefined) {
    passwords.list = [];
  }

  passwords.list.push({ web, un, pw });

  await savePasswords();
}

function close() {
  mainPassword = null;
  passwords = null;
}

export = {
  setFilePath,
  passwordFileExists,
  open,
  getPasswords,
  savePassword,
  deletePassword,
  addPassword,
  close,
}
